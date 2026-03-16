import { logger } from '../../lib/logger'
import { AppError } from '../../utils/app-error'
import type { CodeforcesApiResponse, CodeforcesSubmissionResponse } from './codeforcesTypes'

const CODEFORCES_API_BASE_URL = 'https://codeforces.com/api/'
const DEFAULT_TIMEOUT_MS = 15_000
const DEFAULT_SUBMISSIONS_PAGE_SIZE = 1000
const DEFAULT_SUBMISSIONS_MAX_PAGES = 10

type CodeforcesFetch = typeof fetch
type CodeforcesQueryValue = string | number | boolean | null | undefined

function createRequestSignal(signal?: AbortSignal) {
  return signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
}

function normalizeProviderComment(comment: string | undefined) {
  return comment?.trim().toLowerCase() ?? ''
}

function createProviderError(comment?: string) {
  const normalizedComment = normalizeProviderComment(comment)

  if (normalizedComment.includes('not found')) {
    return new AppError(404, 'Codeforces profile not found', {
      category: 'provider',
      code: 'CODEFORCES_PROFILE_NOT_FOUND',
    })
  }

  if (
    normalizedComment.includes('limit exceeded') ||
    normalizedComment.includes('call limit') ||
    normalizedComment.includes('temporarily unavailable')
  ) {
    return new AppError(503, 'Codeforces API is temporarily unavailable', {
      category: 'provider',
      code: 'CODEFORCES_TEMPORARILY_UNAVAILABLE',
      retryable: true,
    })
  }

  if (normalizedComment.includes('handle')) {
    return new AppError(400, 'Invalid Codeforces handle', {
      category: 'validation',
      code: 'CODEFORCES_INVALID_HANDLE',
    })
  }

  return new AppError(502, 'Codeforces request failed', {
    category: 'provider',
    code: 'CODEFORCES_REQUEST_FAILED',
  })
}

export interface CodeforcesPaginatedSubmissionsResult {
  items: CodeforcesSubmissionResponse[]
  isPartial: boolean
}

export class CodeforcesClient {
  private readonly fetchImpl: CodeforcesFetch

  constructor(input: { fetchImpl?: CodeforcesFetch } = {}) {
    this.fetchImpl = input.fetchImpl ?? fetch
  }

  async getJson<T>(
    method: string,
    query: Record<string, CodeforcesQueryValue>,
    signal?: AbortSignal,
  ): Promise<T> {
    const url = new URL(method, CODEFORCES_API_BASE_URL)

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
        continue
      }

      url.searchParams.set(key, String(value))
    }

    try {
      const response = await this.fetchImpl(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'DevGenome-Backend',
        },
        signal: createRequestSignal(signal),
      })

      if (!response.ok) {
        logger.warn('Codeforces HTTP request failed', {
          method,
          statusCode: response.status,
        })

        throw new AppError(502, 'Codeforces request failed', {
          category: 'provider',
          code: 'CODEFORCES_HTTP_FAILURE',
          retryable: response.status >= 500,
        })
      }

      const payload = (await response.json()) as CodeforcesApiResponse<T>

      if (payload.status !== 'OK') {
        logger.warn('Codeforces API returned failure status', {
          method,
          comment: payload.comment,
        })

        throw createProviderError(payload.comment)
      }

      return payload.result
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new AppError(504, 'Codeforces request timed out', {
          category: 'provider',
          code: 'CODEFORCES_TIMEOUT',
          retryable: true,
        })
      }

      throw new AppError(502, 'Unable to communicate with Codeforces', {
        category: 'provider',
        code: 'CODEFORCES_UNREACHABLE',
        retryable: true,
        cause: error,
      })
    }
  }

  async getPaginatedSubmissions(
    handle: string,
    options: {
      pageSize?: number
      maxPages?: number
      signal?: AbortSignal
    } = {},
  ): Promise<CodeforcesPaginatedSubmissionsResult> {
    const pageSize = options.pageSize ?? DEFAULT_SUBMISSIONS_PAGE_SIZE
    const maxPages = options.maxPages ?? DEFAULT_SUBMISSIONS_MAX_PAGES
    const results: CodeforcesSubmissionResponse[] = []

    let page = 0
    let from = 1
    let isPartial = false

    while (page < maxPages) {
      const batch = await this.getJson<CodeforcesSubmissionResponse[]>(
        'user.status',
        {
          handle,
          from,
          count: pageSize,
        },
        options.signal,
      )

      results.push(...batch)
      page += 1

      if (batch.length < pageSize) {
        break
      }

      from += pageSize
    }

    if (page === maxPages && results.length > 0 && results.length % pageSize === 0) {
      isPartial = true

      logger.warn('Codeforces submission history reached pagination limit', {
        handle,
        pageSize,
        maxPages,
      })
    }

    return {
      items: results,
      isPartial,
    }
  }
}
