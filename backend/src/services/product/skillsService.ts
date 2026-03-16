import { normalizeTargetRole } from '../analysis'
import { presentSkills } from '../../presenters/skillsPresenter'
import {
  getLatestGenomeProfile,
  getLatestSkillGapReports,
  getProductUserState,
} from './productDataService'
import { getCachedProductResponse } from './productCache'
import { selectPreferredSkillGapReport } from './productUtils'

export async function getSkillsResponse(userId: string) {
  const userState = await getProductUserState(userId)

  return getCachedProductResponse({
    scope: 'skills',
    userState,
    loader: async () => {
      const [genomeProfile, skillGapReports] = await Promise.all([
        getLatestGenomeProfile(userId),
        getLatestSkillGapReports(userId),
      ])

      return presentSkills({
        userState,
        genomeProfile,
        preferredSkillGapReport: selectPreferredSkillGapReport({
          reports: skillGapReports,
          targetRole: userState.targetRole,
        }),
        fallbackTargetRole: normalizeTargetRole(userState.targetRole),
      })
    },
  })
}
