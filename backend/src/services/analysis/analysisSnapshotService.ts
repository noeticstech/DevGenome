import { env } from '../../config/env'
import {
  buildCacheTimestamp,
  createUserScopedCacheKey,
  getOrSetRuntimeCacheValue,
} from '../cache'
import { buildFusedAnalysisSignals } from './fusion'
import { getAnalysisContextForUser } from './analysisContextService'
import { deriveAnalysisSignals } from './signalExtractionService'

export async function getCachedAnalysisSnapshotForUser(input: {
  userId: string
  cacheSalt?: string
}) {
  const key = createUserScopedCacheKey({
    scope: 'analysis_snapshot',
    userId: input.userId,
    parts: [input.cacheSalt ?? 'default'],
  })

  return getOrSetRuntimeCacheValue({
    key,
    userId: input.userId,
    ttlMs: env.ANALYSIS_SNAPSHOT_CACHE_TTL_MS,
    loader: async () => {
      const context = await getAnalysisContextForUser(input.userId)
      const signals = deriveAnalysisSignals(context)
      const fusion = buildFusedAnalysisSignals(signals)

      return {
        context,
        signals,
        fusion,
      }
    },
  })
}

export function buildAnalysisSnapshotCacheSalt(input: {
  state: string
  lastSyncAt: Date | null
  repositoryCount: number
  languageCount: number
}) {
  return [
    input.state,
    buildCacheTimestamp(input.lastSyncAt),
    input.repositoryCount,
    input.languageCount,
  ].join('|')
}
