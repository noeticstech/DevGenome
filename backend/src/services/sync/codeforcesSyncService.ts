import { AccountProvider } from '@prisma/client'

import type { SessionPayload } from '../../types/auth'
import { logger } from '../../lib/logger'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../utils/app-error'
import { invalidateUserRuntimeCache } from '../cache'
import { getNormalizedCodeforcesSyncPayload } from '../codeforces'
import { persistCodeforcesSyncPayload } from './codeforcesPersistenceService'
import type { CodeforcesSyncResult, CodeforcesSyncWarning } from './codeforcesSyncTypes'

async function requireAuthenticatedCodeforcesAccountContext(session: SessionPayload) {
  return requireCodeforcesAccountContextForUserId(session.userId)
}

export async function requireCodeforcesAccountContextForUserId(userId: string) {
  const connectedAccount = await prisma.connectedAccount.findFirst({
    where: {
      userId,
      provider: AccountProvider.CODEFORCES,
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
    throw new AppError(400, 'Link a Codeforces handle before starting Codeforces sync', {
      category: 'sync',
      code: 'CODEFORCES_SYNC_ACCOUNT_NOT_LINKED',
    })
  }

  return connectedAccount
}

export async function syncAuthenticatedCodeforcesAccount(
  session: SessionPayload,
): Promise<CodeforcesSyncResult> {
  const account = await requireAuthenticatedCodeforcesAccountContext(session)
  return syncCodeforcesAccountFromContext(account)
}

export async function syncCodeforcesAccountForUserId(
  userId: string,
): Promise<CodeforcesSyncResult> {
  const account = await requireCodeforcesAccountContextForUserId(userId)
  return syncCodeforcesAccountFromContext(account)
}

async function syncCodeforcesAccountFromContext(
  account: Awaited<ReturnType<typeof requireCodeforcesAccountContextForUserId>>,
): Promise<CodeforcesSyncResult> {
  const startedAt = new Date()
  const warnings: CodeforcesSyncWarning[] = []

  logger.info('Codeforces sync started', {
    userId: account.userId,
    connectedAccountId: account.id,
    username: account.username,
  })

  const payload = await getNormalizedCodeforcesSyncPayload(account.username)
  const persistenceResult = await persistCodeforcesSyncPayload({
    userId: account.userId,
    connectedAccountId: account.id,
    payload,
    syncedAt: startedAt,
  })

  if (payload.submissionsArePartial) {
    warnings.push({
      code: 'submission_history_partial',
      message:
        'Codeforces submission history hit the configured fetch limit, so older solved-problem and tag signals may be incomplete.',
    })
  }

  const completedAt = new Date()

  logger.info('Codeforces sync completed', {
    userId: account.userId,
    connectedAccountId: account.id,
    username: payload.profile.username,
    currentRating: payload.profile.currentRating,
    totalSolvedProblems: payload.profile.totalSolvedProblems,
    warningsCount: warnings.length,
  })

  invalidateUserRuntimeCache(account.userId)

  return {
    success: true,
    status: warnings.length > 0 ? 'completed_with_warnings' : 'completed',
    provider: 'codeforces',
    userId: account.userId,
    connectedAccountId: account.id,
    username: payload.profile.username,
    profileSynced: true,
    currentRating: payload.profile.currentRating,
    maxRating: payload.profile.maxRating,
    totalContests: payload.profile.totalContests,
    totalSolvedProblems: payload.profile.totalSolvedProblems,
    recentAcceptedProblems: payload.profile.recentAcceptedProblems,
    contestsSynced: persistenceResult.contestsSynced,
    tagStatsSynced: persistenceResult.tagStatsSynced,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    warnings,
  }
}
