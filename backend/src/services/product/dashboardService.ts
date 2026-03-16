import {
  buildAnalysisSnapshotCacheSalt,
  getCachedAnalysisSnapshotForUser,
} from '../analysis'
import { presentDashboard } from '../../presenters/dashboardPresenter'
import {
  getAggregatedLanguageDistribution,
  getLatestGenomeProfile,
  getLatestSkillGapReports,
  getProductUserState,
  getRepositorySummaries,
} from './productDataService'
import { getCachedProductResponse } from './productCache'
import { selectPreferredSkillGapReport } from './productUtils'

export async function getDashboardResponse(userId: string) {
  const userState = await getProductUserState(userId)

  return getCachedProductResponse({
    scope: 'dashboard',
    userState,
    loader: async () => {
      const [genomeProfile, skillGapReports, languageDistribution, repositorySummaries] =
        await Promise.all([
          getLatestGenomeProfile(userId),
          getLatestSkillGapReports(userId),
          getAggregatedLanguageDistribution(userId),
          getRepositorySummaries(userId),
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

      return presentDashboard({
        userState,
        genomeProfile,
        preferredSkillGapReport: selectPreferredSkillGapReport({
          reports: skillGapReports,
          targetRole: userState.targetRole,
        }),
        languageDistribution,
        recentRepositories: repositorySummaries,
        signals: analysisSnapshot?.signals ?? null,
      })
    },
  })
}
