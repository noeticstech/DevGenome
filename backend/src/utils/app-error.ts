import { Prisma } from '@prisma/client'

export type AppErrorCategory =
  | 'validation'
  | 'auth'
  | 'provider'
  | 'sync'
  | 'analysis'
  | 'ai'
  | 'database'
  | 'job'
  | 'not_found'
  | 'conflict'
  | 'rate_limit'
  | 'internal'

export interface AppErrorOptions {
  category?: AppErrorCategory
  code?: string
  details?: Record<string, unknown>
  retryable?: boolean
  exposeMessage?: boolean
  cause?: unknown
}

function inferCategoryFromStatusCode(statusCode: number): AppErrorCategory {
  if (statusCode === 400 || statusCode === 422) {
    return 'validation'
  }

  if (statusCode === 401 || statusCode === 403) {
    return 'auth'
  }

  if (statusCode === 404) {
    return 'not_found'
  }

  if (statusCode === 409) {
    return 'conflict'
  }

  if (statusCode === 429) {
    return 'rate_limit'
  }

  return 'internal'
}

export class AppError extends Error {
  public readonly category: AppErrorCategory
  public readonly code: string | null
  public readonly details: Record<string, unknown> | null
  public readonly retryable: boolean
  public readonly exposeMessage: boolean

  constructor(
    public readonly statusCode: number,
    message: string,
    options: AppErrorOptions = {},
  ) {
    super(message)
    this.name = 'AppError'
    this.category = options.category ?? inferCategoryFromStatusCode(statusCode)
    this.code = options.code ?? null
    this.details = options.details ?? null
    this.retryable =
      options.retryable ?? [429, 502, 503, 504].includes(statusCode)
    this.exposeMessage = options.exposeMessage ?? true

    if (options.cause !== undefined) {
      ;(this as Error & { cause?: unknown }).cause = options.cause
    }
  }
}

export function normalizeError(error: unknown) {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return new AppError(
      error.code === 'P2002' ? 409 : 503,
      error.code === 'P2002'
        ? 'Database conflict'
        : 'Database request failed',
      {
        category: 'database',
        code: error.code,
        details: {
          meta: error.meta ?? null,
        },
        retryable: error.code !== 'P2002',
        exposeMessage: false,
        cause: error,
      },
    )
  }

  if (
    error instanceof Prisma.PrismaClientValidationError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    return new AppError(503, 'Database request failed', {
      category: 'database',
      code: error.name,
      retryable: true,
      exposeMessage: false,
      cause: error,
    })
  }

  if (error instanceof Error) {
    return new AppError(500, 'Internal server error', {
      category: 'internal',
      code: error.name,
      retryable: false,
      exposeMessage: false,
      cause: error,
    })
  }

  return new AppError(500, 'Internal server error', {
    category: 'internal',
    code: 'UNKNOWN_ERROR',
    retryable: false,
    exposeMessage: false,
    details: {
      value: error,
    },
  })
}

export function serializeErrorForLogging(error: unknown) {
  const normalized = normalizeError(error)
  const normalizedWithCause = normalized as AppError & { cause?: unknown }
  const cause =
    error instanceof Error
      ? error
      : normalizedWithCause.cause instanceof Error
        ? normalizedWithCause.cause
        : null

  return {
    name: error instanceof Error ? error.name : normalized.name,
    message: normalized.message,
    statusCode: normalized.statusCode,
    category: normalized.category,
    code: normalized.code,
    retryable: normalized.retryable,
    details: normalized.details,
    stack: cause?.stack ?? (error instanceof Error ? error.stack : undefined),
  }
}
