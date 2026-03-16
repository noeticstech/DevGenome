import { AccountProvider } from '@prisma/client'

import type { SessionPayload } from '../../types/auth'
import { logger } from '../../lib/logger'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../utils/app-error'
import { invalidateUserRuntimeCache } from '../cache'
import { getNormalizedLeetcodeStats } from '../leetcode'
import { persistLeetcodeSyncPayload } from './leetcodePersistenceService'
import type { LeetcodeSyncResult, LeetcodeSyncWarning } from './leetcodeSyncTypes'

async function requireAuthenticatedLeetcodeAccountContext(session: SessionPayload) {
  return requireLeetcodeAccountContextForUserId(session.userId)
}

export async function requireLeetcodeAccountContextForUserId(userId: string) {
  const connectedAccount = await prisma.connectedAccount.findFirst({
    where: {
      userId,
      provider: AccountProvider.LEETCODE,
      disconnectedAt: null,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      userId: true,
      username: true,
    },
  })

  if (!connectedAccount) {
    throw new AppError(400, 'Link a LeetCode handle before starting LeetCode sync', {
      category: 'sync',
      code: 'LEETCODE_SYNC_ACCOUNT_NOT_LINKED',
    })
  }

  return connectedAccount
}

export async function syncAuthenticatedLeetcodeAccount(
  session: SessionPayload,
): Promise<LeetcodeSyncResult> {
  const account = await requireAuthenticatedLeetcodeAccountContext(session)
  return syncLeetcodeAccountFromContext(account)
}

export async function syncLeetcodeAccountForUserId(
  userId: string,
): Promise<LeetcodeSyncResult> {
  const account = await requireLeetcodeAccountContextForUserId(userId)
  return syncLeetcodeAccountFromContext(account)
}

async function syncLeetcodeAccountFromContext(
  account: Awaited<ReturnType<typeof requireLeetcodeAccountContextForUserId>>,
): Promise<LeetcodeSyncResult> {
  const startedAt = new Date()
  const warnings: LeetcodeSyncWarning[] = []

  logger.info('LeetCode sync started', {
    userId: account.userId,
    connectedAccountId: account.id,
    username: account.username,
  })

  const payload = await getNormalizedLeetcodeStats(account.username)
  const persistenceResult = await persistLeetcodeSyncPayload({
    userId: account.userId,
    connectedAccountId: account.id,
    payload,
    syncedAt: startedAt,
  })

  if (payload.profile.attendedContestsCount === null) {
    warnings.push({
      code: 'contest_data_unavailable',
      message:
        'LeetCode contest signals were not available for this account, so contest-based insights remain limited.',
    })
  }

  const completedAt = new Date()

  logger.info('LeetCode sync completed', {
    userId: account.userId,
    connectedAccountId: account.id,
    username: payload.profile.username,
    totalSolved: payload.profile.totalSolved,
    warningsCount: warnings.length,
  })

  invalidateUserRuntimeCache(account.userId)

  return {
    success: true,
    status: warnings.length > 0 ? 'completed_with_warnings' : 'completed',
    provider: 'leetcode',
    userId: account.userId,
    connectedAccountId: account.id,
    username: payload.profile.username,
    profileSynced: true,
    totalSolved: payload.profile.totalSolved,
    easySolved: payload.profile.easySolved,
    mediumSolved: payload.profile.mediumSolved,
    hardSolved: payload.profile.hardSolved,
    currentStreak: payload.profile.currentStreak,
    topicStatsSynced: persistenceResult.topicStatsSynced,
    languageStatsSynced: persistenceResult.languageStatsSynced,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    warnings,
  }
}
