import {
  buildAnalysisSnapshotCacheSalt,
  getCachedAnalysisSnapshotForUser,
} from '../analysis'
import { presentGenome } from '../../presenters/genomePresenter'
import {
  getLatestGenomeProfile,
  getLatestSkillGapReports,
  getProductUserState,
} from './productDataService'
import { getCachedProductResponse } from './productCache'

export async function getGenomeResponse(userId: string) {
  const userState = await getProductUserState(userId)

  return getCachedProductResponse({
    scope: 'genome',
    userState,
    loader: async () => {
      const [genomeProfile, skillGapReports] = await Promise.all([
        getLatestGenomeProfile(userId),
        getLatestSkillGapReports(userId),
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

      return presentGenome({
        userState,
        genomeProfile,
        skillGapReports,
        signals: analysisSnapshot?.signals ?? null,
        fusion: analysisSnapshot?.fusion ?? null,
      })
    },
  })
}
