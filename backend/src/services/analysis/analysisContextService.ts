import { AccountProvider, CommitBucket } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import { AppError } from '../../utils/app-error'
import type { AnalysisContext } from './analysisTypes'

export async function getAnalysisContextForUser(userId: string): Promise<AnalysisContext> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      username: true,
      createdAt: true,
      preference: {
        select: {
          targetRole: true,
          metadataOnlyAnalysis: true,
          sourceCodeStorageDisabled: true,
        },
      },
      repositories: {
        where: {
          provider: AccountProvider.GITHUB,
        },
        orderBy: {
          providerCreatedAt: 'asc',
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          description: true,
          isFork: true,
          isArchived: true,
          visibility: true,
          primaryLanguage: true,
          defaultBranch: true,
          repoUrl: true,
          topics: true,
          starsCount: true,
          forksCount: true,
          openIssuesCount: true,
          providerCreatedAt: true,
          providerUpdatedAt: true,
          lastPushedAt: true,
          languageStats: {
            orderBy: {
              bytesCount: 'desc',
            },
            select: {
              languageName: true,
              bytesCount: true,
              percentage: true,
            },
          },
          commitSummaries: {
            where: {
              bucketType: CommitBucket.WEEK,
            },
            orderBy: {
              bucketStart: 'asc',
            },
            select: {
              bucketType: true,
              bucketStart: true,
              bucketEnd: true,
              commitCount: true,
              activeDays: true,
            },
          },
        },
      },
      leetcodeProfile: {
        select: {
          username: true,
          totalSolved: true,
          easySolved: true,
          mediumSolved: true,
          hardSolved: true,
          currentStreak: true,
          totalActiveDays: true,
          activeYears: true,
          ranking: true,
          contestRating: true,
          contestGlobalRanking: true,
          contestTopPercentage: true,
          attendedContestsCount: true,
          topicStats: {
            orderBy: {
              problemsSolved: 'desc',
            },
            select: {
              category: true,
              topicName: true,
              problemsSolved: true,
            },
          },
          languageStats: {
            orderBy: {
              problemsSolved: 'desc',
            },
            select: {
              languageName: true,
              problemsSolved: true,
            },
          },
        },
      },
      codeforcesProfile: {
        select: {
          handle: true,
          rank: true,
          maxRank: true,
          currentRating: true,
          maxRating: true,
          totalContests: true,
          recentContests: true,
          totalSolvedProblems: true,
          acceptedSubmissionCount: true,
          recentAcceptedProblems: true,
          recentAcceptedSubmissions: true,
          tagBreadth: true,
          averageSolvedProblemRating: true,
          maxSolvedProblemRating: true,
          contestResults: {
            orderBy: {
              ratingUpdateTime: 'asc',
            },
            select: {
              contestId: true,
              contestName: true,
              rank: true,
              oldRating: true,
              newRating: true,
              ratingDelta: true,
              ratingUpdateTime: true,
            },
          },
          tagStats: {
            orderBy: {
              solvedCount: 'desc',
            },
            select: {
              tagName: true,
              solvedCount: true,
              averageSolvedProblemRating: true,
              maxSolvedProblemRating: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    throw new AppError(404, 'User not found', {
      category: 'analysis',
      code: 'ANALYSIS_USER_NOT_FOUND',
    })
  }

  return {
    user: {
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      createdAt: user.createdAt,
      preference: user.preference
        ? {
            targetRole: user.preference.targetRole,
            metadataOnlyAnalysis: user.preference.metadataOnlyAnalysis,
            sourceCodeStorageDisabled: user.preference.sourceCodeStorageDisabled,
          }
        : null,
    },
    repositories: user.repositories.map((repository) => ({
      ...repository,
      commitSummaries: repository.commitSummaries.map((summary) => ({
        bucketType: summary.bucketType,
        bucketStart: summary.bucketStart,
        bucketEnd: summary.bucketEnd,
        commitCount: summary.commitCount,
        activeDays: summary.activeDays,
      })),
    })),
    leetcodeProfile: user.leetcodeProfile
      ? {
          username: user.leetcodeProfile.username,
          totalSolved: user.leetcodeProfile.totalSolved,
          easySolved: user.leetcodeProfile.easySolved,
          mediumSolved: user.leetcodeProfile.mediumSolved,
          hardSolved: user.leetcodeProfile.hardSolved,
          currentStreak: user.leetcodeProfile.currentStreak,
          totalActiveDays: user.leetcodeProfile.totalActiveDays,
          activeYears: user.leetcodeProfile.activeYears,
          ranking: user.leetcodeProfile.ranking,
          contestRating: user.leetcodeProfile.contestRating,
          contestGlobalRanking: user.leetcodeProfile.contestGlobalRanking,
          contestTopPercentage: user.leetcodeProfile.contestTopPercentage,
          attendedContestsCount: user.leetcodeProfile.attendedContestsCount,
          topicStats: user.leetcodeProfile.topicStats,
          languageStats: user.leetcodeProfile.languageStats,
        }
      : null,
    codeforcesProfile: user.codeforcesProfile
      ? {
          handle: user.codeforcesProfile.handle,
          rank: user.codeforcesProfile.rank,
          maxRank: user.codeforcesProfile.maxRank,
          currentRating: user.codeforcesProfile.currentRating,
          maxRating: user.codeforcesProfile.maxRating,
          totalContests: user.codeforcesProfile.totalContests,
          recentContests: user.codeforcesProfile.recentContests,
          totalSolvedProblems: user.codeforcesProfile.totalSolvedProblems,
          acceptedSubmissionCount: user.codeforcesProfile.acceptedSubmissionCount,
          recentAcceptedProblems: user.codeforcesProfile.recentAcceptedProblems,
          recentAcceptedSubmissions: user.codeforcesProfile.recentAcceptedSubmissions,
          tagBreadth: user.codeforcesProfile.tagBreadth,
          averageSolvedProblemRating: user.codeforcesProfile.averageSolvedProblemRating,
          maxSolvedProblemRating: user.codeforcesProfile.maxSolvedProblemRating,
          contestResults: user.codeforcesProfile.contestResults,
          tagStats: user.codeforcesProfile.tagStats,
        }
      : null,
  }
}
