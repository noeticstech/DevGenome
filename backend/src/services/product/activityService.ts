import {
  buildAnalysisSnapshotCacheSalt,
  getCachedAnalysisSnapshotForUser,
} from '../analysis'
import { presentActivity } from '../../presenters/activityPresenter'
import {
  getAggregatedLanguageDistribution,
  getProductUserState,
  getRepositorySummaries,
  getWeeklyCommitSeries,
} from './productDataService'
import { getCachedProductResponse } from './productCache'

export async function getActivityResponse(userId: string) {
  const userState = await getProductUserState(userId)

  return getCachedProductResponse({
    scope: 'activity',
    userState,
    loader: async () => {
      const [languageDistribution, repositorySummaries, weeklyCommitSeries] =
        await Promise.all([
          getAggregatedLanguageDistribution(userId),
          getRepositorySummaries(userId),
          getWeeklyCommitSeries(userId),
        ])

      const analysisSnapshot = userState.hasSyncedData
        ? await getCachedAnalysisSnapshotForUser({
            userId,
            cacheSalt: buildAnalysisSnapshotCacheSalt({
              state: userState.state,
              lastSyncAt: userState.lastSyncAt,
              repositoryCount: userState.repositoryCount,
              languageCount: userState.languageCount,
            }),
          })
        : null

      return presentActivity({
        userState,
        weeklyCommitSeries,
        languageDistribution,
        repositorySummaries,
        signals: analysisSnapshot?.signals ?? null,
      })
    },
  })
}
