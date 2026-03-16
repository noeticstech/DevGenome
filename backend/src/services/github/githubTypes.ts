export type GithubProviderKey = 'github'

export type GithubRepositoryVisibility = 'public' | 'private' | 'internal'

export interface GithubApiErrorResponse {
  message?: string
  documentation_url?: string
}

export interface GithubProfileResponse {
  id: number
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  bio: string | null
  email: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
}

export interface GithubRepositoryOwnerResponse {
  login: string
}

export interface GithubRepositoryResponse {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  default_branch: string | null
  fork: boolean
  private: boolean
  visibility?: GithubRepositoryVisibility
  archived: boolean
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  pushed_at: string | null
  owner: GithubRepositoryOwnerResponse
  topics?: string[]
}

export type GithubRepositoryLanguagesResponse = Record<string, number>

export interface GithubCommitAuthorResponse {
  date: string | null
  name: string | null
}

export interface GithubCommitResponse {
  sha: string
  commit: {
    author: GithubCommitAuthorResponse | null
    committer: GithubCommitAuthorResponse | null
  }
  author: {
    login: string
  } | null
}

export interface GithubRepositoryReference {
  providerRepoId: string
  ownerLogin: string
  name: string
  fullName: string
  htmlUrl: string
  defaultBranch: string | null
  pushedAt: string | null
}

export interface NormalizedGithubProfile {
  provider: GithubProviderKey
  providerUserId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  profileUrl: string | null
  bio: string | null
  publicRepoCount: number
  followersCount: number
  followingCount: number
  accountCreatedAt: string
}

export interface NormalizedGithubRepository extends GithubRepositoryReference {
  provider: GithubProviderKey
  description: string | null
  isFork: boolean
  isPrivate: boolean
  visibility: GithubRepositoryVisibility
  isArchived: boolean
  primaryLanguage: string | null
  stargazersCount: number
  forksCount: number
  openIssuesCount: number
  topics: string[]
  createdAt: string
  updatedAt: string
}

export interface NormalizedGithubLanguageStat {
  repositoryProviderRepoId: string
  repositoryFullName: string
  repositoryOwnerLogin: string
  languageName: string
  bytes: number
  percentage: number
}

export interface NormalizedGithubRepositoryLanguageSummary {
  repositoryProviderRepoId: string
  repositoryFullName: string
  repositoryOwnerLogin: string
  totalBytes: number
  fetchedAt: string
  languages: NormalizedGithubLanguageStat[]
}

export interface NormalizedGithubActivityBucket {
  bucketStart: string
  bucketEnd: string
  commitCount: number
  activeDays: number
}

export interface NormalizedGithubActivitySummary {
  repositoryProviderRepoId: string
  repositoryFullName: string
  repositoryOwnerLogin: string
  repositoryLastPushedAt: string | null
  contributorUsername: string
  windowStart: string
  windowEnd: string
  recentWindowDays: number
  commitCount: number
  recentCommitCount: number
  activeDays: number
  activeWeeks: number
  firstCommitAt: string | null
  lastCommitAt: string | null
  isPartial: boolean
  collectionMethod: 'commits_api_author_window'
  limitations: string[]
  buckets: NormalizedGithubActivityBucket[]
}
