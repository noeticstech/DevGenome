import { prisma } from '../../lib/prisma'
import { invalidateUserRuntimeCache } from '../cache'
import type { HistoryDeletionResult } from './settingsTypes'

export async function deleteUserHistory(userId: string): Promise<HistoryDeletionResult> {
  const result = await prisma.$transaction(async (tx) => {
    const [
      repositories,
      languageStats,
      commitSummaries,
      leetcodeProfiles,
      leetcodeTopicStats,
      leetcodeLanguageStats,
      codeforcesProfiles,
      codeforcesContestResults,
      codeforcesTagStats,
      genomeProfiles,
      skillGapReports,
      timelineEvents,
    ] = await Promise.all([
      tx.repository.count({ where: { userId } }),
      tx.languageStat.count({ where: { userId } }),
      tx.commitSummary.count({ where: { userId } }),
      tx.leetCodeProfile.count({ where: { userId } }),
      tx.leetCodeTopicStat.count({
        where: {
          profile: {
            is: {
              userId,
            },
          },
        },
      }),
      tx.leetCodeLanguageStat.count({
        where: {
          profile: {
            is: {
              userId,
            },
          },
        },
      }),
      tx.codeforcesProfile.count({ where: { userId } }),
      tx.codeforcesContestResult.count({
        where: {
          profile: {
            is: {
              userId,
            },
          },
        },
      }),
      tx.codeforcesTagStat.count({
        where: {
          profile: {
            is: {
              userId,
            },
          },
        },
      }),
      tx.genomeProfile.count({ where: { userId } }),
      tx.skillGapReport.count({ where: { userId } }),
      tx.timelineEvent.count({ where: { userId } }),
    ])

    const deletedCounts = {
      repositories,
      languageStats,
      commitSummaries,
      leetcodeProfiles,
      leetcodeTopicStats,
      leetcodeLanguageStats,
      codeforcesProfiles,
      codeforcesContestResults,
      codeforcesTagStats,
      genomeProfiles,
      skillGapReports,
      timelineEvents,
    }

    await tx.timelineEvent.deleteMany({
      where: { userId },
    })
    await tx.skillGapReport.deleteMany({
      where: { userId },
    })
    await tx.genomeProfile.deleteMany({
      where: { userId },
    })
    await tx.commitSummary.deleteMany({
      where: { userId },
    })
    await tx.languageStat.deleteMany({
      where: { userId },
    })
    await tx.leetCodeProfile.deleteMany({
      where: { userId },
    })
    await tx.codeforcesProfile.deleteMany({
      where: { userId },
    })
    await tx.repository.deleteMany({
      where: { userId },
    })
    await tx.connectedAccount.updateMany({
      where: { userId },
      data: {
        lastSyncedAt: null,
      },
    })

    const response: HistoryDeletionResult = {
      status:
        Object.values(deletedCounts).every((value) => value === 0)
          ? 'no_history'
          : 'history_deleted',
      deletedCounts,
    }

    return response
  })

  invalidateUserRuntimeCache(userId)

  return result
}
