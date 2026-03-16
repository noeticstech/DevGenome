import { LeetCodeTopicCategory } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import type { NormalizedLeetcodeSyncPayload } from '../leetcode'
import type { LeetcodePersistenceResult } from './leetcodeSyncTypes'

function toTopicCategory(value: 'fundamental' | 'intermediate' | 'advanced') {
  if (value === 'fundamental') {
    return LeetCodeTopicCategory.FUNDAMENTAL
  }

  if (value === 'intermediate') {
    return LeetCodeTopicCategory.INTERMEDIATE
  }

  return LeetCodeTopicCategory.ADVANCED
}

export async function persistLeetcodeSyncPayload(input: {
  userId: string
  connectedAccountId: string
  payload: NormalizedLeetcodeSyncPayload
  syncedAt: Date
}): Promise<LeetcodePersistenceResult> {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.leetCodeProfile.upsert({
      where: {
        userId: input.userId,
      },
      update: {
        connectedAccountId: input.connectedAccountId,
        username: input.payload.profile.username,
        displayName: input.payload.profile.displayName,
        profileUrl: input.payload.profile.profileUrl,
        avatarUrl: input.payload.profile.avatarUrl,
        realName: input.payload.profile.realName,
        aboutMe: input.payload.profile.aboutMe,
        countryName: input.payload.profile.countryName,
        company: input.payload.profile.company,
        school: input.payload.profile.school,
        ranking: input.payload.profile.ranking,
        reputation: input.payload.profile.reputation,
        totalSolved: input.payload.profile.totalSolved,
        easySolved: input.payload.profile.easySolved,
        mediumSolved: input.payload.profile.mediumSolved,
        hardSolved: input.payload.profile.hardSolved,
        currentStreak: input.payload.profile.currentStreak,
        totalActiveDays: input.payload.profile.totalActiveDays,
        activeYears: input.payload.profile.activeYears,
        badgesCount: input.payload.profile.badgesCount,
        contestRating: input.payload.profile.contestRating,
        contestGlobalRanking: input.payload.profile.contestGlobalRanking,
        contestTopPercentage: input.payload.profile.contestTopPercentage,
        attendedContestsCount: input.payload.profile.attendedContestsCount,
        syncedAt: input.syncedAt,
      },
      create: {
        userId: input.userId,
        connectedAccountId: input.connectedAccountId,
        username: input.payload.profile.username,
        displayName: input.payload.profile.displayName,
        profileUrl: input.payload.profile.profileUrl,
        avatarUrl: input.payload.profile.avatarUrl,
        realName: input.payload.profile.realName,
        aboutMe: input.payload.profile.aboutMe,
        countryName: input.payload.profile.countryName,
        company: input.payload.profile.company,
        school: input.payload.profile.school,
        ranking: input.payload.profile.ranking,
        reputation: input.payload.profile.reputation,
        totalSolved: input.payload.profile.totalSolved,
        easySolved: input.payload.profile.easySolved,
        mediumSolved: input.payload.profile.mediumSolved,
        hardSolved: input.payload.profile.hardSolved,
        currentStreak: input.payload.profile.currentStreak,
        totalActiveDays: input.payload.profile.totalActiveDays,
        activeYears: input.payload.profile.activeYears,
        badgesCount: input.payload.profile.badgesCount,
        contestRating: input.payload.profile.contestRating,
        contestGlobalRanking: input.payload.profile.contestGlobalRanking,
        contestTopPercentage: input.payload.profile.contestTopPercentage,
        attendedContestsCount: input.payload.profile.attendedContestsCount,
        syncedAt: input.syncedAt,
      },
      select: {
        id: true,
      },
    })

    const incomingTopicNames = input.payload.topicStats.map((topic) => topic.topicName)
    const incomingLanguageNames = input.payload.languageStats.map((language) => language.languageName)

    await tx.leetCodeTopicStat.deleteMany({
      where: {
        profileId: profile.id,
        topicName: {
          notIn: incomingTopicNames.length > 0 ? incomingTopicNames : ['__none__'],
        },
      },
    })

    await tx.leetCodeLanguageStat.deleteMany({
      where: {
        profileId: profile.id,
        languageName: {
          notIn: incomingLanguageNames.length > 0 ? incomingLanguageNames : ['__none__'],
        },
      },
    })

    for (const topic of input.payload.topicStats) {
      await tx.leetCodeTopicStat.upsert({
        where: {
          profileId_topicName: {
            profileId: profile.id,
            topicName: topic.topicName,
          },
        },
        update: {
          category: toTopicCategory(topic.category),
          problemsSolved: topic.problemsSolved,
        },
        create: {
          profileId: profile.id,
          category: toTopicCategory(topic.category),
          topicName: topic.topicName,
          problemsSolved: topic.problemsSolved,
        },
      })
    }

    for (const language of input.payload.languageStats) {
      await tx.leetCodeLanguageStat.upsert({
        where: {
          profileId_languageName: {
            profileId: profile.id,
            languageName: language.languageName,
          },
        },
        update: {
          problemsSolved: language.problemsSolved,
        },
        create: {
          profileId: profile.id,
          languageName: language.languageName,
          problemsSolved: language.problemsSolved,
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
      topicStatsSynced: input.payload.topicStats.length,
      languageStatsSynced: input.payload.languageStats.length,
    }
  })
}
