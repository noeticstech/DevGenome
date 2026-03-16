import { randomUUID } from 'node:crypto'
import type { RequestHandler } from 'express'

import { logger } from '../lib/logger'

export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = process.hrtime.bigint()
  const requestId = randomUUID()

  res.locals.requestId = requestId
  res.setHeader('X-Request-Id', requestId)

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

    logger.info('HTTP request completed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      durationMs: Number(durationMs.toFixed(1)),
      statusCode: res.statusCode,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? null,
      userId:
        typeof res.locals.session?.userId === 'string'
          ? res.locals.session.userId
          : null,
    })
  })

  next()
}
