import { AccountProvider } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import { invalidateUserRuntimeCache } from '../cache'
import type { GithubDisconnectResult } from './settingsTypes'

export async function disconnectGithubForUser(
  userId: string,
): Promise<GithubDisconnectResult> {
  const result = await prisma.$transaction(async (tx) => {
    const [githubAccount, repositoriesCount, genomeProfilesCount, skillGapReportsCount, timelineEventsCount] =
      await Promise.all([
        tx.connectedAccount.findFirst({
          where: {
            userId,
            provider: AccountProvider.GITHUB,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          select: {
            id: true,
            disconnectedAt: true,
          },
        }),
        tx.repository.count({
          where: { userId },
        }),
        tx.genomeProfile.count({
          where: { userId },
        }),
        tx.skillGapReport.count({
          where: { userId },
        }),
        tx.timelineEvent.count({
          where: { userId },
        }),
      ])

    if (!githubAccount || githubAccount.disconnectedAt !== null) {
      const response: GithubDisconnectResult = {
        status: 'already_disconnected',
        repositoryCount: repositoriesCount,
        analysisRecords:
          genomeProfilesCount + skillGapReportsCount + timelineEventsCount,
      }

      return response
    }

    await tx.connectedAccount.update({
      where: { id: githubAccount.id },
      data: {
        accessTokenEncrypted: null,
        refreshTokenEncrypted: null,
        tokenExpiresAt: null,
        scope: null,
        disconnectedAt: new Date(),
      },
    })

    const response: GithubDisconnectResult = {
      status: 'disconnected',
      repositoryCount: repositoriesCount,
      analysisRecords:
        genomeProfilesCount + skillGapReportsCount + timelineEventsCount,
    }

    return response
  })

  invalidateUserRuntimeCache(userId)

  return result
}
