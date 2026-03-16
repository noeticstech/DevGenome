import { AccountProvider, RepositoryVisibility } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import type { NormalizedGithubRepository } from '../github'
import type {
  GithubRepositoryPersistenceResult,
  PersistedGithubRepositoryContext,
} from './githubSyncTypes'

function normalizeTopics(topics: string[]) {
  return [...new Set(topics)].sort((left, right) => left.localeCompare(right))
}

function mapRepositoryVisibility(visibility: NormalizedGithubRepository['visibility']) {
  switch (visibility) {
    case 'private':
      return RepositoryVisibility.PRIVATE
    case 'internal':
      return RepositoryVisibility.INTERNAL
    default:
      return RepositoryVisibility.PUBLIC
  }
}

function hasDateChanged(currentValue: Date | null, nextValue: Date | null) {
  return (currentValue?.toISOString() ?? null) !== (nextValue?.toISOString() ?? null)
}

function hasRepositoryMetadataChanged(
  currentRepository: {
    userId: string
    connectedAccountId: string
    name: string
    fullName: string
    description: string | null
    isFork: boolean
    isArchived: boolean
    primaryLanguage: string | null
    defaultBranch: string | null
    visibility: RepositoryVisibility
    starsCount: number
    forksCount: number
    openIssuesCount: number
    repoUrl: string
    topics: string[]
    providerCreatedAt: Date | null
    providerUpdatedAt: Date | null
    lastPushedAt: Date | null
  },
  nextRepositoryData: {
    userId: string
    connectedAccountId: string
    name: string
    fullName: string
    description: string | null
    isFork: boolean
    isArchived: boolean
    primaryLanguage: string | null
    defaultBranch: string | null
    visibility: RepositoryVisibility
    starsCount: number
    forksCount: number
    openIssuesCount: number
    repoUrl: string
    topics: string[]
    providerCreatedAt: Date | null
    providerUpdatedAt: Date | null
    lastPushedAt: Date | null
  },
) {
  return (
    currentRepository.userId !== nextRepositoryData.userId ||
    currentRepository.connectedAccountId !== nextRepositoryData.connectedAccountId ||
    currentRepository.name !== nextRepositoryData.name ||
    currentRepository.fullName !== nextRepositoryData.fullName ||
    currentRepository.description !== nextRepositoryData.description ||
    currentRepository.isFork !== nextRepositoryData.isFork ||
    currentRepository.isArchived !== nextRepositoryData.isArchived ||
    currentRepository.primaryLanguage !== nextRepositoryData.primaryLanguage ||
    currentRepository.defaultBranch !== nextRepositoryData.defaultBranch ||
    currentRepository.visibility !== nextRepositoryData.visibility ||
    currentRepository.starsCount !== nextRepositoryData.starsCount ||
    currentRepository.forksCount !== nextRepositoryData.forksCount ||
    currentRepository.openIssuesCount !== nextRepositoryData.openIssuesCount ||
    currentRepository.repoUrl !== nextRepositoryData.repoUrl ||
    currentRepository.topics.join('|') !== nextRepositoryData.topics.join('|') ||
    hasDateChanged(currentRepository.providerCreatedAt, nextRepositoryData.providerCreatedAt) ||
    hasDateChanged(currentRepository.providerUpdatedAt, nextRepositoryData.providerUpdatedAt) ||
    hasDateChanged(currentRepository.lastPushedAt, nextRepositoryData.lastPushedAt)
  )
}

export async function persistGithubRepositories(input: {
  userId: string
  connectedAccountId: string
  repositories: NormalizedGithubRepository[]
  syncedAt: Date
}): Promise<GithubRepositoryPersistenceResult> {
  return prisma.$transaction(async (tx) => {
    const existingRepositories = await tx.repository.findMany({
      where: {
        connectedAccountId: input.connectedAccountId,
        provider: AccountProvider.GITHUB,
      },
      select: {
        id: true,
        providerRepoId: true,
        userId: true,
        connectedAccountId: true,
        name: true,
        fullName: true,
        description: true,
        isFork: true,
        isArchived: true,
        primaryLanguage: true,
        defaultBranch: true,
        visibility: true,
        starsCount: true,
        forksCount: true,
        openIssuesCount: true,
        repoUrl: true,
        topics: true,
        providerCreatedAt: true,
        providerUpdatedAt: true,
        lastPushedAt: true,
      },
    })

    const existingRepositoryByProviderId = new Map(
      existingRepositories.map((repository) => [repository.providerRepoId, repository]),
    )

    const currentProviderRepoIds = new Set(
      input.repositories.map((repository) => repository.providerRepoId),
    )

    const repositories: PersistedGithubRepositoryContext[] = []
    let createdCount = 0
    let updatedCount = 0
    let unchangedCount = 0

    for (const repository of input.repositories) {
      const existingRepository = existingRepositoryByProviderId.get(repository.providerRepoId)
      const metadataData = {
        userId: input.userId,
        connectedAccountId: input.connectedAccountId,
        name: repository.name,
        fullName: repository.fullName,
        description: repository.description,
        isFork: repository.isFork,
        isArchived: repository.isArchived,
        primaryLanguage: repository.primaryLanguage,
        defaultBranch: repository.defaultBranch,
        visibility: mapRepositoryVisibility(repository.visibility),
        starsCount: repository.stargazersCount,
        forksCount: repository.forksCount,
        openIssuesCount: repository.openIssuesCount,
        repoUrl: repository.htmlUrl,
        topics: normalizeTopics(repository.topics),
        providerCreatedAt: new Date(repository.createdAt),
        providerUpdatedAt: new Date(repository.updatedAt),
        lastPushedAt: repository.pushedAt ? new Date(repository.pushedAt) : null,
      }
      const nextRepositoryData = {
        ...metadataData,
        syncedAt: input.syncedAt,
      }

      if (!existingRepository) {
        createdCount += 1

        const createdRepository = await tx.repository.create({
          data: {
            provider: AccountProvider.GITHUB,
            providerRepoId: repository.providerRepoId,
            ...nextRepositoryData,
          },
          select: {
            id: true,
          },
        })

        repositories.push({
          repositoryId: createdRepository.id,
          providerRepoId: repository.providerRepoId,
          ownerLogin: repository.ownerLogin,
          name: repository.name,
          fullName: repository.fullName,
          htmlUrl: repository.htmlUrl,
          defaultBranch: repository.defaultBranch,
          pushedAt: repository.pushedAt,
        })

        continue
      }

      const metadataChanged = hasRepositoryMetadataChanged(existingRepository, metadataData)

      await tx.repository.update({
        where: {
          provider_providerRepoId: {
            provider: AccountProvider.GITHUB,
            providerRepoId: repository.providerRepoId,
          },
        },
        data: nextRepositoryData,
      })

      if (metadataChanged) {
        updatedCount += 1
      } else {
        unchangedCount += 1
      }

      repositories.push({
        repositoryId: existingRepository.id,
        providerRepoId: repository.providerRepoId,
        ownerLogin: repository.ownerLogin,
        name: repository.name,
        fullName: repository.fullName,
        htmlUrl: repository.htmlUrl,
        defaultBranch: repository.defaultBranch,
        pushedAt: repository.pushedAt,
      })
    }

    const untouchedExistingCount = existingRepositories.filter(
      (repository) => !currentProviderRepoIds.has(repository.providerRepoId),
    ).length

    return {
      repositories,
      createdCount,
      updatedCount,
      unchangedCount,
      untouchedExistingCount,
    }
  })
}
