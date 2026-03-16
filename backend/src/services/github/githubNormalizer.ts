import type {
  GithubProfileResponse,
  GithubRepositoryLanguagesResponse,
  GithubRepositoryReference,
  GithubRepositoryResponse,
  NormalizedGithubActivitySummary,
  NormalizedGithubLanguageStat,
  NormalizedGithubProfile,
  NormalizedGithubRepository,
  NormalizedGithubRepositoryLanguageSummary,
} from './githubTypes'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_WEEK_MS = 7 * ONE_DAY_MS

function normalizeIsoDate(value: string | null | undefined) {
  if (!value) {
    return null
  }

  return new Date(value).toISOString()
}

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100
}

function startOfUtcDay(date: Date) {
  const copy = new Date(date)
  copy.setUTCHours(0, 0, 0, 0)
  return copy
}

function endOfUtcDay(date: Date) {
  const copy = new Date(date)
  copy.setUTCHours(23, 59, 59, 999)
  return copy
}

function startOfUtcWeek(date: Date) {
  const copy = startOfUtcDay(date)
  const day = copy.getUTCDay()
  const diffToMonday = day === 0 ? -6 : 1 - day

  copy.setUTCDate(copy.getUTCDate() + diffToMonday)
  return copy
}

function endOfUtcWeek(date: Date) {
  const copy = startOfUtcWeek(date)
  copy.setUTCDate(copy.getUTCDate() + 6)
  return endOfUtcDay(copy)
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * ONE_DAY_MS)
}

function resolveRepositoryVisibility(repository: GithubRepositoryResponse) {
  if (repository.visibility) {
    return repository.visibility
  }

  return repository.private ? 'private' : 'public'
}

export function normalizeGithubProfile(
  profile: GithubProfileResponse,
): NormalizedGithubProfile {
  return {
    provider: 'github',
    providerUserId: String(profile.id),
    username: profile.login,
    displayName: profile.name,
    avatarUrl: profile.avatar_url,
    profileUrl: profile.html_url,
    bio: profile.bio,
    publicRepoCount: profile.public_repos,
    followersCount: profile.followers,
    followingCount: profile.following,
    accountCreatedAt: new Date(profile.created_at).toISOString(),
  }
}

export function normalizeGithubRepository(
  repository: GithubRepositoryResponse,
): NormalizedGithubRepository {
  return {
    provider: 'github',
    providerRepoId: String(repository.id),
    ownerLogin: repository.owner.login,
    name: repository.name,
    fullName: repository.full_name,
    description: repository.description,
    htmlUrl: repository.html_url,
    defaultBranch: repository.default_branch,
    isFork: repository.fork,
    isPrivate: repository.private,
    visibility: resolveRepositoryVisibility(repository),
    isArchived: repository.archived,
    primaryLanguage: repository.language,
    stargazersCount: repository.stargazers_count,
    forksCount: repository.forks_count,
    openIssuesCount: repository.open_issues_count,
    topics: repository.topics ?? [],
    createdAt: new Date(repository.created_at).toISOString(),
    updatedAt: new Date(repository.updated_at).toISOString(),
    pushedAt: normalizeIsoDate(repository.pushed_at),
  }
}

export function normalizeGithubRepositoryLanguageSummary(
  repository: GithubRepositoryReference,
  languageBytes: GithubRepositoryLanguagesResponse,
): NormalizedGithubRepositoryLanguageSummary {
  const fetchedAt = new Date().toISOString()
  const totalBytes = Object.values(languageBytes).reduce((sum, bytes) => sum + bytes, 0)

  const languages: NormalizedGithubLanguageStat[] = Object.entries(languageBytes)
    .sort((left, right) => right[1] - left[1])
    .map(([languageName, bytes]) => ({
      repositoryProviderRepoId: repository.providerRepoId,
      repositoryFullName: repository.fullName,
      repositoryOwnerLogin: repository.ownerLogin,
      languageName,
      bytes,
      percentage: totalBytes === 0 ? 0 : roundToTwoDecimals((bytes / totalBytes) * 100),
    }))

  return {
    repositoryProviderRepoId: repository.providerRepoId,
    repositoryFullName: repository.fullName,
    repositoryOwnerLogin: repository.ownerLogin,
    totalBytes,
    fetchedAt,
    languages,
  }
}

function createWeeklyBuckets(input: {
  commitDates: Date[]
  windowStart: Date
  windowEnd: Date
}) {
  const bucketCounts = new Map<string, number>()
  const bucketActiveDays = new Map<string, Set<string>>()
  const seriesStart = startOfUtcWeek(input.windowStart)
  const seriesEnd = endOfUtcWeek(input.windowEnd)

  for (const commitDate of input.commitDates) {
    const commitTime = commitDate.getTime()

    if (commitTime < seriesStart.getTime() || commitTime > seriesEnd.getTime()) {
      continue
    }

    const bucketStart = startOfUtcWeek(commitDate).toISOString()
    const dayKey = startOfUtcDay(commitDate).toISOString()

    bucketCounts.set(bucketStart, (bucketCounts.get(bucketStart) ?? 0) + 1)

    const activeDays = bucketActiveDays.get(bucketStart) ?? new Set<string>()
    activeDays.add(dayKey)
    bucketActiveDays.set(bucketStart, activeDays)
  }

  const buckets = []

  for (let cursor = new Date(seriesStart); cursor.getTime() <= seriesEnd.getTime(); cursor = new Date(cursor.getTime() + ONE_WEEK_MS)) {
    const bucketStart = new Date(cursor)
    const bucketEnd = new Date(
      Math.min(cursor.getTime() + ONE_WEEK_MS - 1, seriesEnd.getTime()),
    )
    const bucketKey = bucketStart.toISOString()

    buckets.push({
      bucketStart: bucketStart.toISOString(),
      bucketEnd: bucketEnd.toISOString(),
      commitCount: bucketCounts.get(bucketKey) ?? 0,
      activeDays: bucketActiveDays.get(bucketKey)?.size ?? 0,
    })
  }

  return buckets
}

export function normalizeGithubActivitySummary(input: {
  repository: GithubRepositoryReference
  contributorUsername: string
  commitDates: string[]
  windowStart: Date
  windowEnd: Date
  recentWindowDays: number
  isPartial?: boolean
  additionalLimitations?: string[]
}): NormalizedGithubActivitySummary {
  const commitDates = input.commitDates
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((left, right) => left.getTime() - right.getTime())

  const activeDays = new Set(
    commitDates.map((date) => startOfUtcDay(date).toISOString()),
  ).size

  const activeWeeks = new Set(
    commitDates.map((date) => startOfUtcWeek(date).toISOString()),
  ).size

  const recentWindowStart = startOfUtcDay(
    addDays(input.windowEnd, Math.max(1 - input.recentWindowDays, 0)),
  )

  const recentCommitCount = commitDates.filter(
    (date) => date.getTime() >= recentWindowStart.getTime(),
  ).length

  const limitations = [
    'Uses the GitHub commits API filtered by author within a bounded date window, so older activity outside that window is intentionally excluded.',
    'GitHub commit attribution can miss co-authored commits or commits made with alternate emails that are not linked to the same GitHub user.',
    ...(input.additionalLimitations ?? []),
  ]

  return {
    repositoryProviderRepoId: input.repository.providerRepoId,
    repositoryFullName: input.repository.fullName,
    repositoryOwnerLogin: input.repository.ownerLogin,
    repositoryLastPushedAt: input.repository.pushedAt,
    contributorUsername: input.contributorUsername,
    windowStart: input.windowStart.toISOString(),
    windowEnd: input.windowEnd.toISOString(),
    recentWindowDays: input.recentWindowDays,
    commitCount: commitDates.length,
    recentCommitCount,
    activeDays,
    activeWeeks,
    firstCommitAt: commitDates[0]?.toISOString() ?? null,
    lastCommitAt: commitDates.at(-1)?.toISOString() ?? null,
    isPartial: input.isPartial ?? false,
    collectionMethod: 'commits_api_author_window',
    limitations,
    buckets: createWeeklyBuckets({
      commitDates,
      windowStart: input.windowStart,
      windowEnd: input.windowEnd,
    }),
  }
}
