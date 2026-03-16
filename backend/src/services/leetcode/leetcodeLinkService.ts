import { AccountProvider } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import { AppError } from '../../utils/app-error'
import { invalidateUserRuntimeCache } from '../cache'
import { getNormalizedLeetcodeProfile } from './leetcodeUserService'
import type { LeetcodeLinkResult } from './leetcodeTypes'

export async function linkLeetcodeAccountForUser(input: {
  userId: string
  username: string
}): Promise<LeetcodeLinkResult> {
  const profile = await getNormalizedLeetcodeProfile(input.username)

  const result = await prisma.$transaction(async (tx) => {
    const existingByProviderUserId = await tx.connectedAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: AccountProvider.LEETCODE,
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
        'That LeetCode account is already linked to another DevGenome user',
      )
    }

    const existingUserAccount = await tx.connectedAccount.findUnique({
      where: {
        userId_provider: {
          userId: input.userId,
          provider: AccountProvider.LEETCODE,
        },
      },
      select: {
        id: true,
        providerUserId: true,
        disconnectedAt: true,
        lastSyncedAt: true,
      },
    })

    const usernameChanged =
      existingUserAccount !== null &&
      existingUserAccount.providerUserId !== profile.providerUserId

    if (usernameChanged) {
      await tx.leetCodeProfile.deleteMany({
        where: {
          userId: input.userId,
        },
      })
    }

    const connectedAccount = await tx.connectedAccount.upsert({
      where: {
        userId_provider: {
          userId: input.userId,
          provider: AccountProvider.LEETCODE,
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
        lastSyncedAt: usernameChanged ? null : existingUserAccount?.lastSyncedAt ?? null,
        disconnectedAt: null,
      },
      create: {
        userId: input.userId,
        provider: AccountProvider.LEETCODE,
        providerUserId: profile.providerUserId,
        username: profile.username,
        profileUrl: profile.profileUrl,
        avatarUrl: profile.avatarUrl,
      },
    })

    const status: LeetcodeLinkResult['status'] =
      existingUserAccount === null
        ? 'linked'
        : existingUserAccount.disconnectedAt !== null || usernameChanged
          ? 'relinked'
          : 'already_linked'

    const response: LeetcodeLinkResult = {
      success: true,
      provider: 'leetcode',
      status,
      userId: input.userId,
      connectedAccountId: connectedAccount.id,
      username: connectedAccount.username,
      profileUrl: connectedAccount.profileUrl ?? profile.profileUrl,
      lastSyncedAt: connectedAccount.lastSyncedAt?.toISOString() ?? null,
      message:
        status === 'already_linked'
          ? 'LeetCode is already linked to this DevGenome account.'
          : usernameChanged
            ? 'LeetCode was relinked with a new handle. Run sync to refresh problem-solving data.'
            : 'LeetCode was linked successfully. Run sync to import problem-solving data.',
    }

    return response
  })

  invalidateUserRuntimeCache(input.userId)

  return result
}
