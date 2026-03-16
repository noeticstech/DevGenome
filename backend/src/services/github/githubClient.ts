import { logger } from '../../lib/logger'
import { AppError } from '../../utils/app-error'
import type { GithubApiErrorResponse } from './githubTypes'

const GITHUB_API_BASE_URL = 'https://api.github.com'
const GITHUB_API_VERSION = '2022-11-28'
const DEFAULT_TIMEOUT_MS = 15_000
const DEFAULT_PER_PAGE = 100
const DEFAULT_MAX_PAGES = 10

type GithubFetch = typeof fetch
type GithubQueryValue = string | number | boolean | null | undefined

export interface GithubClientRequestOptions {
  query?: Record<string, GithubQueryValue>
  headers?: Record<string, string>
  signal?: AbortSignal
}

export interface GithubPaginatedRequestOptions extends GithubClientRequestOptions {
  perPage?: number
  maxPages?: number
}

export interface GithubPaginatedResult<T> {
  items: T[]
  isPartial: boolean
}

async function parseProviderError(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as GithubApiErrorResponse
  } catch {
    return null
  }
}

function parseNextPageUrl(linkHeader: string | null) {
  if (!linkHeader) {
    return null
  }

  const links = linkHeader.split(',')

  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/)

    if (match?.[2] === 'next') {
      return match[1]
    }
  }

  return null
}

function createRequestSignal(signal?: AbortSignal) {
  return signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
}

export class GithubClient {
  private readonly accessToken: string
  private readonly fetchImpl: GithubFetch

  constructor(input: { accessToken: string; fetchImpl?: GithubFetch }) {
    this.accessToken = input.accessToken
    this.fetchImpl = input.fetchImpl ?? fetch
  }

  async getJson<T>(pathOrUrl: string, options: GithubClientRequestOptions = {}) {
    const response = await this.performRequest(pathOrUrl, options)
    return (await response.json()) as T
  }

  async getPaginated<T>(
    pathOrUrl: string,
    options: GithubPaginatedRequestOptions = {},
  ): Promise<T[]> {
    const result = await this.getPaginatedWithMeta<T>(pathOrUrl, options)
    return result.items
  }

  async getPaginatedWithMeta<T>(
    pathOrUrl: string,
    options: GithubPaginatedRequestOptions = {},
  ): Promise<GithubPaginatedResult<T>> {
    const perPage = options.perPage ?? DEFAULT_PER_PAGE
    const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES
    const results: T[] = []

    let pageCount = 0
    let nextPageUrl: string | null = this.buildUrl(pathOrUrl, {
      ...options.query,
      per_page: perPage,
    })

    while (nextPageUrl && pageCount < maxPages) {
      const response = await this.performRequest(nextPageUrl, {
        ...options,
        query: undefined,
      })

      const payload = (await response.json()) as unknown

      if (!Array.isArray(payload)) {
        throw new AppError(502, 'GitHub returned an unexpected paginated response', {
          category: 'provider',
          code: 'GITHUB_INVALID_PAGINATED_RESPONSE',
        })
      }

      results.push(...(payload as T[]))
      nextPageUrl = parseNextPageUrl(response.headers.get('link'))
      pageCount += 1
    }

    if (nextPageUrl) {
      logger.warn('GitHub pagination stopped at configured page limit', {
        maxPages,
        path: pathOrUrl,
      })
    }

    return {
      items: results,
      isPartial: Boolean(nextPageUrl),
    }
  }

  private async performRequest(
    pathOrUrl: string,
    options: GithubClientRequestOptions,
  ): Promise<Response> {
    const url = this.buildUrl(pathOrUrl, options.query)

    try {
      const response = await this.fetchImpl(url, {
        method: 'GET',
        headers: this.buildHeaders(options.headers),
        signal: createRequestSignal(options.signal),
      })

      if (!response.ok) {
        throw await this.createRequestError(response, pathOrUrl)
      }

      return response
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new AppError(504, 'GitHub request timed out', {
          category: 'provider',
          code: 'GITHUB_TIMEOUT',
          retryable: true,
        })
      }

      throw new AppError(502, 'Unable to communicate with GitHub', {
        category: 'provider',
        code: 'GITHUB_UNREACHABLE',
        retryable: true,
        cause: error,
      })
    }
  }

  private buildUrl(pathOrUrl: string, query?: Record<string, GithubQueryValue>) {
    const url = new URL(pathOrUrl, GITHUB_API_BASE_URL)

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
          continue
        }

        url.searchParams.set(key, String(value))
      }
    }

    return url.toString()
  }

  private buildHeaders(extraHeaders?: Record<string, string>) {
    return {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${this.accessToken}`,
      'User-Agent': 'DevGenome-Backend',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
      ...extraHeaders,
    }
  }

  private async createRequestError(response: Response, pathOrUrl: string) {
    const providerError = await parseProviderError(response)
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining')
    const rateLimitReset = response.headers.get('x-ratelimit-reset')

    if (response.status === 401) {
      return new AppError(401, 'GitHub authentication has expired', {
        category: 'auth',
        code: 'GITHUB_AUTH_EXPIRED',
      })
    }

    if (
      response.status === 403 &&
      rateLimitRemaining !== null &&
      Number(rateLimitRemaining) <= 0
    ) {
      logger.warn('GitHub API rate limit reached', {
        path: pathOrUrl,
        rateLimitReset,
      })

      return new AppError(503, 'GitHub API rate limit reached', {
        category: 'provider',
        code: 'GITHUB_RATE_LIMITED',
        retryable: true,
        details: {
          rateLimitReset,
        },
      })
    }

    if (response.status === 404) {
      return new AppError(404, 'GitHub resource not found', {
        category: 'provider',
        code: 'GITHUB_RESOURCE_NOT_FOUND',
      })
    }

    if (response.status === 409) {
      return new AppError(409, 'GitHub repository has no commit history yet', {
        category: 'provider',
        code: 'GITHUB_NO_COMMIT_HISTORY',
      })
    }

    if (response.status === 422) {
      return new AppError(400, 'Invalid GitHub request parameters', {
        category: 'validation',
        code: 'GITHUB_INVALID_REQUEST',
      })
    }

    const providerMessage = providerError?.message?.trim()

    logger.warn('GitHub API request failed', {
      path: pathOrUrl,
      statusCode: response.status,
      providerMessage,
    })

    return new AppError(502, 'GitHub request failed', {
      category: 'provider',
      code: 'GITHUB_REQUEST_FAILED',
      retryable: response.status >= 500,
    })
  }
}
