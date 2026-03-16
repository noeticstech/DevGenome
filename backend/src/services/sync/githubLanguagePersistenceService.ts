import { prisma } from '../../lib/prisma'
import type { NormalizedGithubRepositoryLanguageSummary } from '../github'
import type { GithubLanguagePersistenceResult } from './githubSyncTypes'

function hasLanguageStatChanged(
  currentLanguageStat: {
    userId: string
    bytesCount: number
    percentage: number
  },
  nextLanguageStat: {
    userId: string
    bytesCount: number
    percentage: number
  },
) {
  return (
    currentLanguageStat.userId !== nextLanguageStat.userId ||
    currentLanguageStat.bytesCount !== nextLanguageStat.bytesCount ||
    currentLanguageStat.percentage !== nextLanguageStat.percentage
  )
}

export async function persistGithubRepositoryLanguages(input: {
  userId: string
  repositoryId: string
  languageSummary: NormalizedGithubRepositoryLanguageSummary
  syncedAt: Date
}): Promise<GithubLanguagePersistenceResult> {
  return prisma.$transaction(async (tx) => {
    const existingLanguageStats = await tx.languageStat.findMany({
      where: {
        repositoryId: input.repositoryId,
      },
      select: {
        id: true,
        languageName: true,
        userId: true,
        bytesCount: true,
        percentage: true,
      },
    })

    const existingLanguageByName = new Map(
      existingLanguageStats.map((languageStat) => [languageStat.languageName, languageStat]),
    )

    const syncedLanguageNames = input.languageSummary.languages.map(
      (language) => language.languageName,
    )

    if (syncedLanguageNames.length === 0) {
      await tx.languageStat.deleteMany({
        where: {
          repositoryId: input.repositoryId,
        },
      })

      return {
        recordsSynced: 0,
      }
    }

    for (const language of input.languageSummary.languages) {
      const existingLanguage = existingLanguageByName.get(language.languageName)
      const nextLanguageData = {
        userId: input.userId,
        bytesCount: language.bytes,
        percentage: language.percentage,
        syncedAt: input.syncedAt,
      }

      if (!existingLanguage) {
        await tx.languageStat.create({
          data: {
            repositoryId: input.repositoryId,
            languageName: language.languageName,
            ...nextLanguageData,
          },
        })

        continue
      }

      if (
        hasLanguageStatChanged(existingLanguage, {
          userId: nextLanguageData.userId,
          bytesCount: nextLanguageData.bytesCount,
          percentage: nextLanguageData.percentage,
        })
      ) {
        await tx.languageStat.update({
          where: {
            repositoryId_languageName: {
              repositoryId: input.repositoryId,
              languageName: language.languageName,
            },
          },
          data: nextLanguageData,
        })
      } else {
        await tx.languageStat.update({
          where: {
            repositoryId_languageName: {
              repositoryId: input.repositoryId,
              languageName: language.languageName,
            },
          },
          data: {
            syncedAt: input.syncedAt,
          },
        })
      }
    }

    await tx.languageStat.deleteMany({
      where: {
        repositoryId: input.repositoryId,
        languageName: {
          notIn: syncedLanguageNames,
        },
      },
    })

    return {
      recordsSynced: input.languageSummary.languages.length,
    }
  })
}
