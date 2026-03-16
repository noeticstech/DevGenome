import type { SessionPayload } from '../../types/auth'
import { AppError } from '../../utils/app-error'
import { requireAuthenticatedGitHubAccountContext } from '../auth/auth.service'
import { GithubClient } from './githubClient'
import { normalizeGithubActivitySummary } from './githubNormalizer'
import type {
  GithubCommitResponse,
  GithubRepositoryReference,
  NormalizedGithubActivitySummary,
} from './githubTypes'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_WINDOW_DAYS = 84
const DEFAULT_RECENT_WINDOW_DAYS = 28

export interface GithubActivitySummaryOptions {
  windowDays?: number
  recentWindowDays?: number
  perPage?: number
  maxPages?: number
  fetchImpl?: typeof fetch
}

function assertPositiveInteger(value: number, fieldName: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new AppError(400, `${fieldName} must be a positive integer`)
  }
}

function assertRepositoryReference(repository: GithubRepositoryReference) {
  if (!repository.ownerLogin || !repository.name || !repository.fullName) {
    throw new AppError(400, 'A valid GitHub repository reference is required')
  }
}

function extractCommitDate(commit: GithubCommitResponse) {
  return commit.commit.author?.date ?? commit.commit.committer?.date ?? null
}

function normalizeOptions(options: GithubActivitySummaryOptions) {
  const windowDays = options.windowDays ?? DEFAULT_WINDOW_DAYS
  const recentWindowDays = Math.min(
    options.recentWindowDays ?? DEFAULT_RECENT_WINDOW_DAYS,
    windowDays,
  )

  assertPositiveInteger(windowDays, 'windowDays')
  assertPositiveInteger(recentWindowDays, 'recentWindowDays')

  if (options.perPage !== undefined) {
    assertPositiveInteger(options.perPage, 'perPage')
  }

  if (options.maxPages !== undefined) {
    assertPositiveInteger(options.maxPages, 'maxPages')
  }

  return {
    windowDays,
    recentWindowDays,
  }
}

export async function getNormalizedGithubRepositoryActivitySummary(
  accessToken: string,
  contributorUsername: string,
  repository: GithubRepositoryReference,
  options: GithubActivitySummaryOptions = {},
): Promise<NormalizedGithubActivitySummary> {
  assertRepositoryReference(repository)

  const normalizedOptions = normalizeOptions(options)
  const windowEnd = new Date()
  const windowStart = new Date(
    windowEnd.getTime() - (normalizedOptions.windowDays - 1) * ONE_DAY_MS,
  )

  const client = new GithubClient({
    accessToken,
    fetchImpl: options.fetchImpl,
  })

  try {
    const result = await client.getPaginatedWithMeta<GithubCommitResponse>(
      `/repos/${encodeURIComponent(repository.ownerLogin)}/${encodeURIComponent(repository.name)}/commits`,
      {
        perPage: options.perPage,
        maxPages: options.maxPages,
        query: {
          author: contributorUsername,
          since: windowStart.toISOString(),
          until: windowEnd.toISOString(),
        },
      },
    )

    const commitDates = result.items
      .map(extractCommitDate)
      .filter((value): value is string => Boolean(value))

    const additionalLimitations = [
      'This summary uses the commits listing endpoint instead of GitHub stats endpoints because the stats endpoints may be delayed or return 202 while GitHub computes repository statistics.',
    ]

    if (result.isPartial) {
      additionalLimitations.push(
        'Results were capped by the configured pagination limit, so commit counts in this window may be understated for very high-volume repositories.',
      )
    }

    return normalizeGithubActivitySummary({
      repository,
      contributorUsername,
      commitDates,
      windowStart,
      windowEnd,
      recentWindowDays: normalizedOptions.recentWindowDays,
      isPartial: result.isPartial,
      additionalLimitations,
    })
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 409) {
      return normalizeGithubActivitySummary({
        repository,
        contributorUsername,
        commitDates: [],
        windowStart,
        windowEnd,
        recentWindowDays: normalizedOptions.recentWindowDays,
        additionalLimitations: [
          'The repository currently has no commit history, so activity metrics are intentionally empty.',
          'This summary uses the commits listing endpoint instead of GitHub stats endpoints because the stats endpoints may be delayed or return 202 while GitHub computes repository statistics.',
        ],
      })
    }

    throw error
  }
}

export async function getNormalizedGithubRepositoryActivitySummaryForSession(
  session: SessionPayload | null,
  repository: GithubRepositoryReference,
  options: GithubActivitySummaryOptions = {},
): Promise<NormalizedGithubActivitySummary> {
  const account = await requireAuthenticatedGitHubAccountContext(session)

  return getNormalizedGithubRepositoryActivitySummary(
    account.accessToken,
    account.username,
    repository,
    options,
  )
}
