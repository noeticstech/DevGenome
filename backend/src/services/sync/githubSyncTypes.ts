import type { GithubProviderKey, GithubRepositoryReference } from '../github/githubTypes'

export interface GithubSyncWarning {
  code:
    | 'repositories_left_untouched'
    | 'repository_language_sync_failed'
    | 'repository_activity_sync_failed'
    | 'github_enrichment_stopped'
  message: string
  repositoryFullName?: string
}

export interface PersistedGithubRepositoryContext extends GithubRepositoryReference {
  repositoryId: string
}

export interface GithubRepositoryPersistenceResult {
  repositories: PersistedGithubRepositoryContext[]
  createdCount: number
  updatedCount: number
  unchangedCount: number
  untouchedExistingCount: number
}

export interface GithubLanguagePersistenceResult {
  recordsSynced: number
}

export interface GithubActivityPersistenceResult {
  summariesSynced: number
  bucketRecordsSynced: number
}

export interface GithubSyncResult {
  success: boolean
  status: 'completed' | 'completed_with_warnings'
  provider: GithubProviderKey
  userId: string
  connectedAccountId: string
  profileSynced: boolean
  repositoriesFetched: number
  repositoriesCreated: number
  repositoriesUpdated: number
  repositoriesUnchanged: number
  repositoriesLeftUntouched: number
  languageRepositoriesSynced: number
  languageRecordsSynced: number
  activityRepositoriesSynced: number
  activityBucketRecordsSynced: number
  startedAt: string
  completedAt: string
  warnings: GithubSyncWarning[]
}
