import type { SessionPayload } from '../../types/auth'
import { logger } from '../../lib/logger'
import { AppError } from '../../utils/app-error'
import { invalidateUserRuntimeCache } from '../cache'
import {
  requireAuthenticatedGitHubAccountContext,
  requireGitHubAccountContextForUserId,
} from '../auth/auth.service'
import {
  getNormalizedGithubProfile,
  getNormalizedGithubRepositoryActivitySummary,
  getNormalizedGithubRepositoryLanguages,
  listNormalizedGithubRepositories,
} from '../github'
import { persistGithubRepositoryActivitySummary } from './githubActivityPersistenceService'
import { persistGithubRepositoryLanguages } from './githubLanguagePersistenceService'
import {
  markGithubAccountSyncCompleted,
  persistGithubProfileAndAccount,
} from './githubProfilePersistenceService'
import { persistGithubRepositories } from './githubRepositoryPersistenceService'
import type { GithubSyncResult, GithubSyncWarning } from './githubSyncTypes'

function shouldStopEnrichment(error: unknown) {
  return error instanceof AppError && [401, 503].includes(error.statusCode)
}

function createRepositoryWarning(
  code: GithubSyncWarning['code'],
  repositoryFullName: string,
  message: string,
): GithubSyncWarning {
  return {
    code,
    repositoryFullName,
    message,
  }
}

export async function syncAuthenticatedGithubAccount(
  session: SessionPayload,
): Promise<GithubSyncResult> {
  const account = await requireAuthenticatedGitHubAccountContext(session)
  return syncGithubAccountFromContext(account)
}

export async function syncGithubAccountForUserId(
  userId: string,
): Promise<GithubSyncResult> {
  const account = await requireGitHubAccountContextForUserId(userId)
  return syncGithubAccountFromContext(account)
}

async function syncGithubAccountFromContext(
  account: Awaited<ReturnType<typeof requireGitHubAccountContextForUserId>>,
): Promise<GithubSyncResult> {
  const startedAt = new Date()
  const warnings: GithubSyncWarning[] = []

  logger.info('GitHub sync started', {
    userId: account.userId,
    connectedAccountId: account.connectedAccountId,
  })

  const profile = await getNormalizedGithubProfile(account.accessToken)

  if (profile.providerUserId !== account.providerUserId) {
    throw new AppError(409, 'GitHub account identity mismatch', {
      category: 'sync',
      code: 'GITHUB_SYNC_IDENTITY_MISMATCH',
    })
  }

  await persistGithubProfileAndAccount({
    userId: account.userId,
    connectedAccountId: account.connectedAccountId,
    profile,
  })

  const normalizedRepositories = await listNormalizedGithubRepositories(account.accessToken)
  const repositoryPersistence = await persistGithubRepositories({
    userId: account.userId,
    connectedAccountId: account.connectedAccountId,
    repositories: normalizedRepositories,
    syncedAt: startedAt,
  })

  if (repositoryPersistence.untouchedExistingCount > 0) {
    warnings.push({
      code: 'repositories_left_untouched',
      message: `${repositoryPersistence.untouchedExistingCount} previously synced repositories were not returned by GitHub in this run and were left untouched for MVP simplicity.`,
    })
  }

  let languageRepositoriesSynced = 0
  let languageRecordsSynced = 0
  let activityRepositoriesSynced = 0
  let activityBucketRecordsSynced = 0
  let enrichmentStopped = false

  for (const repository of repositoryPersistence.repositories) {
    if (enrichmentStopped) {
      break
    }

    try {
      const languageSummary = await getNormalizedGithubRepositoryLanguages(
        account.accessToken,
        repository,
      )

      const languagePersistence = await persistGithubRepositoryLanguages({
        userId: account.userId,
        repositoryId: repository.repositoryId,
        languageSummary,
        syncedAt: startedAt,
      })

      languageRepositoriesSynced += 1
      languageRecordsSynced += languagePersistence.recordsSynced
    } catch (error) {
      logger.warn('GitHub language sync failed for repository', {
        userId: account.userId,
        repositoryFullName: repository.fullName,
        statusCode: error instanceof AppError ? error.statusCode : undefined,
      })

      warnings.push(
        createRepositoryWarning(
          'repository_language_sync_failed',
          repository.fullName,
          `Language stats could not be synced for ${repository.fullName}.`,
        ),
      )

      if (shouldStopEnrichment(error)) {
        enrichmentStopped = true
        warnings.push({
          code: 'github_enrichment_stopped',
          message:
            'GitHub enrichment stopped early because the provider connection became invalid or GitHub rate limits were reached.',
        })
        break
      }
    }

    try {
      const activitySummary = await getNormalizedGithubRepositoryActivitySummary(
        account.accessToken,
        profile.username,
        repository,
      )

      const activityPersistence = await persistGithubRepositoryActivitySummary({
        userId: account.userId,
        repositoryId: repository.repositoryId,
        activitySummary,
        syncedAt: startedAt,
      })

      activityRepositoriesSynced += activityPersistence.summariesSynced
      activityBucketRecordsSynced += activityPersistence.bucketRecordsSynced
    } catch (error) {
      logger.warn('GitHub activity sync failed for repository', {
        userId: account.userId,
        repositoryFullName: repository.fullName,
        statusCode: error instanceof AppError ? error.statusCode : undefined,
      })

      warnings.push(
        createRepositoryWarning(
          'repository_activity_sync_failed',
          repository.fullName,
          `Activity summary could not be synced for ${repository.fullName}.`,
        ),
      )

      if (shouldStopEnrichment(error)) {
        enrichmentStopped = true
        warnings.push({
          code: 'github_enrichment_stopped',
          message:
            'GitHub enrichment stopped early because the provider connection became invalid or GitHub rate limits were reached.',
        })
        break
      }
    }
  }

  const completedAt = new Date()

  await markGithubAccountSyncCompleted({
    connectedAccountId: account.connectedAccountId,
    completedAt,
  })

  const result: GithubSyncResult = {
    success: true,
    status: warnings.length > 0 ? 'completed_with_warnings' : 'completed',
    provider: 'github',
    userId: account.userId,
    connectedAccountId: account.connectedAccountId,
    profileSynced: true,
    repositoriesFetched: normalizedRepositories.length,
    repositoriesCreated: repositoryPersistence.createdCount,
    repositoriesUpdated: repositoryPersistence.updatedCount,
    repositoriesUnchanged: repositoryPersistence.unchangedCount,
    repositoriesLeftUntouched: repositoryPersistence.untouchedExistingCount,
    languageRepositoriesSynced,
    languageRecordsSynced,
    activityRepositoriesSynced,
    activityBucketRecordsSynced,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    warnings,
  }

  logger.info('GitHub sync completed', {
    userId: account.userId,
    connectedAccountId: account.connectedAccountId,
    repositoriesFetched: result.repositoriesFetched,
    warningsCount: warnings.length,
  })

  invalidateUserRuntimeCache(account.userId)

  return result
}
