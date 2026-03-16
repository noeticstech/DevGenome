import type { RequestHandler } from 'express'

import { env } from '../config/env'

function shouldDisableCaching(path: string) {
  return path.startsWith('/auth') || path.startsWith(env.API_PREFIX)
}

export const securityHeaders: RequestHandler = (req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site')

  if (env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=15552000; includeSubDomains',
    )
  }

  if (shouldDisableCaching(req.path)) {
    res.setHeader('Cache-Control', 'private, no-store')
    res.setHeader('Pragma', 'no-cache')
  }

  next()
}
