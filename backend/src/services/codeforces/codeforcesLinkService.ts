import { AccountProvider } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import { AppError } from '../../utils/app-error'
import { invalidateUserRuntimeCache } from '../cache'
import { getNormalizedCodeforcesIdentity } from './codeforcesUserService'
import type { CodeforcesLinkResult } from './codeforcesTypes'

export async function linkCodeforcesAccountForUser(input: {
  userId: string
  handle: string
}): Promise<CodeforcesLinkResult> {
  const profile = await getNormalizedCodeforcesIdentity(input.handle)

  const result = await prisma.$transaction(async (tx) => {
    const existingByProviderUserId = await tx.connectedAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: AccountProvider.CODEFORCES,
          providerUserId: profile.providerUserId,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    })

    if (existingByProviderUserId && existingByProviderUserId.userId !== input.userId) {
      throw new AppError(
        409,
        'That Codeforces account is already linked to another DevGenome user',
      )
    }

    const existingUserAccount = await tx.connectedAccount.findUnique({
      where: {
        userId_provider: {
          userId: input.userId,
          provider: AccountProvider.CODEFORCES,
        },
      },
      select: {
        providerUserId: true,
        disconnectedAt: true,
        lastSyncedAt: true,
      },
    })

    const handleChanged =
      existingUserAccount !== null &&
      existingUserAccount.providerUserId !== profile.providerUserId

    if (handleChanged) {
      await tx.codeforcesProfile.deleteMany({
        where: {
          userId: input.userId,
        },
      })
    }

    const connectedAccount = await tx.connectedAccount.upsert({
      where: {
        userId_provider: {
          userId: input.userId,
          provider: AccountProvider.CODEFORCES,
        },
      },
      update: {
        providerUserId: profile.providerUserId,
        username: profile.username,
        profileUrl: profile.profileUrl,
        avatarUrl: profile.avatarUrl,
        accessTokenEncrypted: null,
        refreshTokenEncrypted: null,
        tokenExpiresAt: null,
        scope: null,
        lastSyncedAt: handleChanged ? null : existingUserAccount?.lastSyncedAt ?? null,
        disconnectedAt: null,
      },
      create: {
        userId: input.userId,
        provider: AccountProvider.CODEFORCES,
        providerUserId: profile.providerUserId,
        username: profile.username,
        profileUrl: profile.profileUrl,
        avatarUrl: profile.avatarUrl,
      },
    })

    const status: CodeforcesLinkResult['status'] =
      existingUserAccount === null
        ? 'linked'
        : existingUserAccount.disconnectedAt !== null || handleChanged
          ? 'relinked'
          : 'already_linked'

    const response: CodeforcesLinkResult = {
      success: true,
      provider: 'codeforces',
      status,
      userId: input.userId,
      connectedAccountId: connectedAccount.id,
      username: connectedAccount.username,
      profileUrl: connectedAccount.profileUrl ?? profile.profileUrl,
      lastSyncedAt: connectedAccount.lastSyncedAt?.toISOString() ?? null,
      message:
        status === 'already_linked'
          ? 'Codeforces is already linked to this DevGenome account.'
          : handleChanged
            ? 'Codeforces was relinked with a new handle. Run sync to refresh competitive-programming data.'
            : 'Codeforces was linked successfully. Run sync to import contest and problem-solving data.',
    }

    return response
  })

  invalidateUserRuntimeCache(input.userId)

  return result
}
