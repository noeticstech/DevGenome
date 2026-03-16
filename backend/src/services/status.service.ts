import { env } from '../config/env'
import { getOperationalSummary } from './operations/operationalSummaryService'

export async function getApiStatus() {
  const operationalSummary = await getOperationalSummary()

  return {
    status: operationalSummary.status === 'ok' ? 'ready' : 'degraded',
    service: 'devgenome-backend',
    environment: env.NODE_ENV,
    apiPrefix: env.API_PREFIX,
    analysisMode: 'metadata-only',
    sourceCodeStorage: 'disabled',
    cache: {
      enabled: env.CACHE_ENABLED,
      productResponseTtlMs: env.PRODUCT_RESPONSE_CACHE_TTL_MS,
      analysisSnapshotTtlMs: env.ANALYSIS_SNAPSHOT_CACHE_TTL_MS,
      aiResponseTtlMs: env.AI_RESPONSE_CACHE_TTL_MS,
    },
    ai: {
      geminiConfigured: Boolean(env.GEMINI_API_KEY),
      model: env.GEMINI_MODEL,
    },
    prisma: {
      provider: 'postgresql',
      configured: true,
      health: operationalSummary.database,
    },
    jobs: {
      backendQueue: 'postgresql',
      workerEnabled: env.JOB_WORKER_ENABLED,
      schedulerEnabled: env.JOB_SCHEDULER_ENABLED,
      summary: operationalSummary.jobs,
    },
    warnings: operationalSummary.warnings,
    timestamp: new Date().toISOString(),
  }
}
