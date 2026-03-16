import {
  buildAnalysisSnapshotCacheSalt,
  getCachedAnalysisSnapshotForUser,
} from '../analysis'
import { presentTimeline } from '../../presenters/timelinePresenter'
import {
  getLatestGenomeProfile,
  getLatestSkillGapReports,
  getProductUserState,
  getTimelineAnalytics,
  getTimelineEvents,
} from './productDataService'
import { getCachedProductResponse } from './productCache'
import { selectPreferredSkillGapReport } from './productUtils'

export async function getTimelineResponse(userId: string) {
  const userState = await getProductUserState(userId)

  return getCachedProductResponse({
    scope: 'timeline',
    userState,
    loader: async () => {
      const [genomeProfile, skillGapReports, timelineEvents, timelineAnalytics] =
        await Promise.all([
          getLatestGenomeProfile(userId),
          getLatestSkillGapReports(userId),
          getTimelineEvents(userId),
          getTimelineAnalytics(userId),
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

      return presentTimeline({
        userState,
        genomeProfile,
        preferredSkillGapReport: selectPreferredSkillGapReport({
          reports: skillGapReports,
          targetRole: userState.targetRole,
        }),
        timelineEvents,
        technologyJourney: timelineAnalytics.technologyJourney,
        growthMetrics: {
          repositoryGrowth: timelineAnalytics.repositoryGrowth,
          activityGrowth: timelineAnalytics.activityGrowth,
          technologyBreadth: timelineAnalytics.technologyBreadth,
        },
        signals: analysisSnapshot?.signals ?? null,
      })
    },
  })
}
