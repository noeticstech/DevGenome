import express from 'express'

import { env } from '../config/env'
import { errorHandler } from '../middleware/error-handler'
import { notFoundMiddleware } from '../middleware/not-found'
import { requestLogger } from '../middleware/request-logger'
import { requireTrustedOrigin } from '../middleware/require-trusted-origin'
import { securityHeaders } from '../middleware/security-headers'
import { router } from '../routes'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', env.TRUST_PROXY)
  app.use(
    express.json({
      limit: `${env.REQUEST_BODY_LIMIT_KB}kb`,
    }),
  )
  app.use(
    express.urlencoded({
      extended: true,
      limit: `${env.REQUEST_BODY_LIMIT_KB}kb`,
    }),
  )
  app.use(requestLogger)
  app.use(securityHeaders)
  app.use(requireTrustedOrigin)
  app.use(router)
  app.use(notFoundMiddleware)
  app.use(errorHandler)

  return app
}
