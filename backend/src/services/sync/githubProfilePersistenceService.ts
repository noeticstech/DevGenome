import { AccountProvider } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import { AppError } from '../../utils/app-error'
import type { NormalizedGithubProfile } from '../github'

export interface GithubProfilePersistenceResult {
  userUpdated: boolean
  connectedAccountUpdated: boolean
}

function hasValueChanged<T>(currentValue: T, nextValue: T) {
  return currentValue !== nextValue
}

export async function persistGithubProfileAndAccount(input: {
  userId: string
  connectedAccountId: string
  profile: NormalizedGithubProfile
}): Promise<GithubProfilePersistenceResult> {
  return prisma.$transaction(async (tx) => {
    const [user, connectedAccount] = await Promise.all([
      tx.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          bio: true,
        },
      }),
      tx.connectedAccount.findUnique({
        where: { id: input.connectedAccountId },
        select: {
          id: true,
          provider: true,
          providerUserId: true,
          username: true,
          profileUrl: true,
          avatarUrl: true,
        },
      }),
    ])

    if (!user || !connectedAccount || connectedAccount.provider !== AccountProvider.GITHUB) {
      throw new AppError(404, 'GitHub connected account not found')
    }

    const nextUserData = {
      displayName: input.profile.displayName ?? user.displayName,
      username: input.profile.username,
      avatarUrl: input.profile.avatarUrl ?? user.avatarUrl,
      bio: input.profile.bio ?? user.bio,
    }

    const nextAccountData = {
      providerUserId: input.profile.providerUserId,
      username: input.profile.username,
      profileUrl: input.profile.profileUrl ?? connectedAccount.profileUrl,
      avatarUrl: input.profile.avatarUrl ?? connectedAccount.avatarUrl,
    }

    const userUpdated =
      hasValueChanged(user.displayName, nextUserData.displayName) ||
      hasValueChanged(user.username, nextUserData.username) ||
      hasValueChanged(user.avatarUrl, nextUserData.avatarUrl) ||
      hasValueChanged(user.bio, nextUserData.bio)

    const connectedAccountUpdated =
      hasValueChanged(connectedAccount.providerUserId, nextAccountData.providerUserId) ||
      hasValueChanged(connectedAccount.username, nextAccountData.username) ||
      hasValueChanged(connectedAccount.profileUrl, nextAccountData.profileUrl) ||
      hasValueChanged(connectedAccount.avatarUrl, nextAccountData.avatarUrl)

    if (userUpdated) {
      await tx.user.update({
        where: { id: user.id },
        data: nextUserData,
      })
    }

    if (connectedAccountUpdated) {
      await tx.connectedAccount.update({
        where: { id: connectedAccount.id },
        data: nextAccountData,
      })
    }

    return {
      userUpdated,
      connectedAccountUpdated,
    }
  })
}

export async function markGithubAccountSyncCompleted(input: {
  connectedAccountId: string
  completedAt: Date
}) {
  await prisma.connectedAccount.update({
    where: { id: input.connectedAccountId },
    data: {
      lastSyncedAt: input.completedAt,
    },
  })
}
