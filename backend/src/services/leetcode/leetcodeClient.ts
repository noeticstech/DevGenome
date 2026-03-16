import { logger } from '../../lib/logger'
import { AppError } from '../../utils/app-error'
import type { LeetcodeGraphqlResponse } from './leetcodeTypes'

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql'
const DEFAULT_TIMEOUT_MS = 15_000

type LeetcodeFetch = typeof fetch

function createRequestSignal(signal?: AbortSignal) {
  return signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
}

export class LeetcodeClient {
  private readonly fetchImpl: LeetcodeFetch

  constructor(input: { fetchImpl?: LeetcodeFetch } = {}) {
    this.fetchImpl = input.fetchImpl ?? fetch
  }

  async query<T>(input: {
    operationName: string
    query: string
    variables?: Record<string, unknown>
    signal?: AbortSignal
  }): Promise<T> {
    try {
      const response = await this.fetchImpl(LEETCODE_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          referer: 'https://leetcode.com/',
          'user-agent': 'DevGenome-Backend',
        },
        signal: createRequestSignal(input.signal),
        body: JSON.stringify({
          operationName: input.operationName,
          query: input.query,
          variables: input.variables ?? {},
        }),
      })

      if (response.status === 404) {
        throw new AppError(404, 'LeetCode profile not found', {
          category: 'provider',
          code: 'LEETCODE_PROFILE_NOT_FOUND',
        })
      }

      if (response.status === 429) {
        throw new AppError(503, 'LeetCode rate limit reached', {
          category: 'provider',
          code: 'LEETCODE_RATE_LIMITED',
          retryable: true,
        })
      }

      if (!response.ok) {
        logger.warn('LeetCode request failed', {
          operationName: input.operationName,
          statusCode: response.status,
        })

        throw new AppError(502, 'LeetCode request failed', {
          category: 'provider',
          code: 'LEETCODE_REQUEST_FAILED',
          retryable: response.status >= 500,
        })
      }

      const payload = (await response.json()) as LeetcodeGraphqlResponse<T>

      if (payload.errors && payload.errors.length > 0) {
        logger.warn('LeetCode GraphQL returned errors', {
          operationName: input.operationName,
          errors: payload.errors.map((error) => error.message),
        })

        throw new AppError(502, 'LeetCode request failed', {
          category: 'provider',
          code: 'LEETCODE_GRAPHQL_ERRORS',
        })
      }

      if (!payload.data) {
        throw new AppError(502, 'LeetCode returned an empty response', {
          category: 'provider',
          code: 'LEETCODE_EMPTY_RESPONSE',
        })
      }

      return payload.data
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new AppError(504, 'LeetCode request timed out', {
          category: 'provider',
          code: 'LEETCODE_TIMEOUT',
          retryable: true,
        })
      }

      throw new AppError(502, 'Unable to communicate with LeetCode', {
        category: 'provider',
        code: 'LEETCODE_UNREACHABLE',
        retryable: true,
        cause: error,
      })
    }
  }
}
