import { env } from '../../config/env'
import {
  buildCacheTimestamp,
  createUserScopedCacheKey,
  getOrSetRuntimeCacheValue,
} from '../cache'
import type { ProductUserState } from './productDataService'

export function buildProductResponseVersion(userState: ProductUserState) {
  return [
    userState.state,
    buildCacheTimestamp(userState.lastSyncAt),
    buildCacheTimestamp(userState.lastAnalysisAt),
    userState.targetRole ?? 'none',
    userState.repositoryCount,
    userState.languageCount,
    userState.connectedGithubUsername ?? 'none',
  ].join('|')
}

export async function getCachedProductResponse<T>(input: {
  scope: 'dashboard' | 'genome' | 'activity' | 'skills' | 'timeline'
  userState: ProductUserState
  loader: () => Promise<T>
}) {
  const key = createUserScopedCacheKey({
    scope: `product_${input.scope}`,
    userId: input.userState.userId,
    parts: [buildProductResponseVersion(input.userState)],
  })

  return getOrSetRuntimeCacheValue({
    key,
    userId: input.userState.userId,
    ttlMs: env.PRODUCT_RESPONSE_CACHE_TTL_MS,
    loader: input.loader,
  })
}
