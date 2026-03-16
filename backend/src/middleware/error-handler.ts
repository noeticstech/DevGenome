import type { ErrorRequestHandler } from 'express'

import { logger } from '../lib/logger'
import { normalizeError, serializeErrorForLogging } from '../utils/app-error'

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  void _next

  const normalizedError = normalizeError(error)
  const requestId =
    typeof res.locals.requestId === 'string'
      ? res.locals.requestId
      : req.get('x-request-id') ?? null
  const statusCode = normalizedError.statusCode
  const message = normalizedError.exposeMessage
    ? normalizedError.message
    : 'Internal server error'

  const logMeta = {
    requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    userId:
      typeof res.locals.session?.userId === 'string'
        ? res.locals.session.userId
        : null,
    error: serializeErrorForLogging(error),
  }

  if (statusCode >= 500) {
    logger.error('HTTP request failed', logMeta)
  } else {
    logger.warn('HTTP request failed', logMeta)
  }

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      category: normalizedError.category,
      code: normalizedError.code,
      requestId,
    },
  })
}
