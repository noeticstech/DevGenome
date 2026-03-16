import express from 'express'

import { errorHandler } from '../middleware/error-handler'
import { notFoundMiddleware } from '../middleware/not-found'
import { requestLogger } from '../middleware/request-logger'
import { router } from '../routes'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(requestLogger)
  app.use(router)
  app.use(notFoundMiddleware)
  app.use(errorHandler)

  return app
}
