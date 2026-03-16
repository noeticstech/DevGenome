import { prisma } from '../../lib/prisma'
import type { NormalizedCodeforcesSyncPayload } from '../codeforces'
import type { CodeforcesPersistenceResult } from './codeforcesSyncTypes'

export async function persistCodeforcesSyncPayload(input: {
  userId: string
  connectedAccountId: string
  payload: NormalizedCodeforcesSyncPayload
  syncedAt: Date
}): Promise<CodeforcesPersistenceResult> {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.codeforcesProfile.upsert({
      where: {
        userId: input.userId,
      },
      update: {
        connectedAccountId: input.connectedAccountId,
        handle: input.payload.profile.username,
        displayName: input.payload.profile.displayName,
        profileUrl: input.payload.profile.profileUrl,
        avatarUrl: input.payload.profile.avatarUrl,
        rank: input.payload.profile.rank,
        maxRank: input.payload.profile.maxRank,
        currentRating: input.payload.profile.currentRating,
        maxRating: input.payload.profile.maxRating,
        contribution: input.payload.profile.contribution,
        friendOfCount: input.payload.profile.friendOfCount,
        organization: input.payload.profile.organization,
        country: input.payload.profile.country,
        city: input.payload.profile.city,
        registrationAt: input.payload.profile.registrationAt
          ? new Date(input.payload.profile.registrationAt)
          : null,
        lastOnlineAt: input.payload.profile.lastOnlineAt
          ? new Date(input.payload.profile.lastOnlineAt)
          : null,
        totalContests: input.payload.profile.totalContests,
        recentContests: input.payload.profile.recentContests,
        totalSolvedProblems: input.payload.profile.totalSolvedProblems,
        acceptedSubmissionCount: input.payload.profile.acceptedSubmissionCount,
        recentAcceptedProblems: input.payload.profile.recentAcceptedProblems,
        recentAcceptedSubmissions: input.payload.profile.recentAcceptedSubmissions,
        tagBreadth: input.payload.profile.tagBreadth,
        averageSolvedProblemRating: input.payload.profile.averageSolvedProblemRating,
        maxSolvedProblemRating: input.payload.profile.maxSolvedProblemRating,
        syncedAt: input.syncedAt,
      },
      create: {
        userId: input.userId,
        connectedAccountId: input.connectedAccountId,
        handle: input.payload.profile.username,
        displayName: input.payload.profile.displayName,
        profileUrl: input.payload.profile.profileUrl,
        avatarUrl: input.payload.profile.avatarUrl,
        rank: input.payload.profile.rank,
        maxRank: input.payload.profile.maxRank,
        currentRating: input.payload.profile.currentRating,
        maxRating: input.payload.profile.maxRating,
        contribution: input.payload.profile.contribution,
        friendOfCount: input.payload.profile.friendOfCount,
        organization: input.payload.profile.organization,
        country: input.payload.profile.country,
        city: input.payload.profile.city,
        registrationAt: input.payload.profile.registrationAt
          ? new Date(input.payload.profile.registrationAt)
          : null,
        lastOnlineAt: input.payload.profile.lastOnlineAt
          ? new Date(input.payload.profile.lastOnlineAt)
          : null,
        totalContests: input.payload.profile.totalContests,
        recentContests: input.payload.profile.recentContests,
        totalSolvedProblems: input.payload.profile.totalSolvedProblems,
        acceptedSubmissionCount: input.payload.profile.acceptedSubmissionCount,
        recentAcceptedProblems: input.payload.profile.recentAcceptedProblems,
        recentAcceptedSubmissions: input.payload.profile.recentAcceptedSubmissions,
        tagBreadth: input.payload.profile.tagBreadth,
        averageSolvedProblemRating: input.payload.profile.averageSolvedProblemRating,
        maxSolvedProblemRating: input.payload.profile.maxSolvedProblemRating,
        syncedAt: input.syncedAt,
      },
      select: {
        id: true,
      },
    })

    const incomingContestIds = input.payload.contestResults.map((contest) => contest.contestId)
    const incomingTagNames = input.payload.tagStats.map((tag) => tag.tagName)

    await tx.codeforcesContestResult.deleteMany({
      where: {
        profileId: profile.id,
        contestId: {
          notIn: incomingContestIds.length > 0 ? incomingContestIds : [-1],
        },
      },
    })

    await tx.codeforcesTagStat.deleteMany({
      where: {
        profileId: profile.id,
        tagName: {
          notIn: incomingTagNames.length > 0 ? incomingTagNames : ['__none__'],
        },
      },
    })

    for (const contest of input.payload.contestResults) {
      await tx.codeforcesContestResult.upsert({
        where: {
          profileId_contestId: {
            profileId: profile.id,
            contestId: contest.contestId,
          },
        },
        update: {
          contestName: contest.contestName,
          rank: contest.rank,
          oldRating: contest.oldRating,
          newRating: contest.newRating,
          ratingDelta: contest.ratingDelta,
          ratingUpdateTime: new Date(contest.ratingUpdateTime),
        },
        create: {
          profileId: profile.id,
          contestId: contest.contestId,
          contestName: contest.contestName,
          rank: contest.rank,
          oldRating: contest.oldRating,
          newRating: contest.newRating,
          ratingDelta: contest.ratingDelta,
          ratingUpdateTime: new Date(contest.ratingUpdateTime),
        },
      })
    }

    for (const tag of input.payload.tagStats) {
      await tx.codeforcesTagStat.upsert({
        where: {
          profileId_tagName: {
            profileId: profile.id,
            tagName: tag.tagName,
          },
        },
        update: {
          solvedCount: tag.solvedCount,
          averageSolvedProblemRating: tag.averageSolvedProblemRating,
          maxSolvedProblemRating: tag.maxSolvedProblemRating,
        },
        create: {
          profileId: profile.id,
          tagName: tag.tagName,
          solvedCount: tag.solvedCount,
          averageSolvedProblemRating: tag.averageSolvedProblemRating,
          maxSolvedProblemRating: tag.maxSolvedProblemRating,
        },
      })
    }

    await tx.connectedAccount.update({
      where: {
        id: input.connectedAccountId,
      },
      data: {
        providerUserId: input.payload.profile.providerUserId,
        username: input.payload.profile.username,
        profileUrl: input.payload.profile.profileUrl,
        avatarUrl: input.payload.profile.avatarUrl,
        lastSyncedAt: input.syncedAt,
        disconnectedAt: null,
      },
    })

    return {
      contestsSynced: input.payload.contestResults.length,
      tagStatsSynced: input.payload.tagStats.length,
    }
  })
}
