import type { RequestHandler } from 'express'

import { env } from '../config/env'
import { AppError } from '../utils/app-error'

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function extractOriginFromRequestHeader(value: string | undefined) {
  if (!value) {
    return null
  }

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export const requireTrustedOrigin: RequestHandler = (req, _res, next) => {
  if (!UNSAFE_METHODS.has(req.method.toUpperCase())) {
    next()
    return
  }

  const origin =
    extractOriginFromRequestHeader(req.get('origin') ?? undefined) ??
    extractOriginFromRequestHeader(req.get('referer') ?? undefined)

  if (!origin) {
    if (env.NODE_ENV !== 'production') {
      next()
      return
    }

    next(
      new AppError(403, 'Request origin is not allowed', {
        category: 'auth',
        code: 'TRUSTED_ORIGIN_REQUIRED',
        exposeMessage: false,
      }),
    )
    return
  }

  if (env.TRUSTED_APP_ORIGINS.includes(origin)) {
    next()
    return
  }

  next(
    new AppError(403, 'Request origin is not allowed', {
      category: 'auth',
      code: 'UNTRUSTED_ORIGIN',
      details: {
        origin,
      },
      exposeMessage: false,
    }),
  )
}
