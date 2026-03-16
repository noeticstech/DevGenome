import { createApp } from './app/create-app'
import { env } from './config/env'
import { startScheduledSyncRunner } from './jobs/scheduler/syncScheduler'
import { startBackgroundJobWorker } from './jobs/worker'
import { logger } from './lib/logger'

const app = createApp()
const jobWorker = startBackgroundJobWorker()
const syncScheduler = startScheduledSyncRunner()

const server = app.listen(env.PORT, () => {
  logger.info('DevGenome backend listening', {
    apiPrefix: env.API_PREFIX,
    port: env.PORT,
  })
})

function shutdown(signal: string) {
  logger.warn(`Received ${signal}, shutting down gracefully`)
  syncScheduler.stop()
  jobWorker.stop()
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
