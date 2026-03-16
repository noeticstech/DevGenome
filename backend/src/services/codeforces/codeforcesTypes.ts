export type CodeforcesProviderKey = 'codeforces'

export interface CodeforcesApiResponse<T> {
  status: 'OK' | 'FAILED'
  comment?: string
  result: T
}

export interface CodeforcesUserResponse {
  handle: string
  email?: string
  vkId?: string
  openId?: string
  firstName?: string
  lastName?: string
  country?: string
  city?: string
  organization?: string
  contribution?: number
  rank?: string
  rating?: number
  maxRank?: string
  maxRating?: number
  lastOnlineTimeSeconds?: number
  registrationTimeSeconds?: number
  friendOfCount?: number
  avatar?: string
  titlePhoto?: string
}

export interface CodeforcesContestResponse {
  contestId: number
  contestName: string
  handle: string
  rank: number
  ratingUpdateTimeSeconds: number
  oldRating: number
  newRating: number
}

export interface CodeforcesSubmissionResponse {
  id: number
  contestId?: number
  creationTimeSeconds: number
  verdict?: string
  programmingLanguage: string
  problem: {
    contestId?: number
    problemsetName?: string
    index: string
    name: string
    rating?: number
    tags: string[]
  }
}

export interface NormalizedCodeforcesIdentity {
  provider: CodeforcesProviderKey
  providerUserId: string
  username: string
  displayName: string | null
  profileUrl: string
  avatarUrl: string | null
}

export interface NormalizedCodeforcesProfile extends NormalizedCodeforcesIdentity {
  rank: string | null
  maxRank: string | null
  currentRating: number | null
  maxRating: number | null
  contribution: number | null
  friendOfCount: number | null
  organization: string | null
  country: string | null
  city: string | null
  registrationAt: string | null
  lastOnlineAt: string | null
  totalContests: number
  recentContests: number
  totalSolvedProblems: number
  acceptedSubmissionCount: number
  recentAcceptedProblems: number
  recentAcceptedSubmissions: number
  tagBreadth: number
  averageSolvedProblemRating: number | null
  maxSolvedProblemRating: number | null
}

export interface NormalizedCodeforcesContestResult {
  contestId: number
  contestName: string
  rank: number
  oldRating: number
  newRating: number
  ratingDelta: number
  ratingUpdateTime: string
}

export interface NormalizedCodeforcesTagStat {
  tagName: string
  solvedCount: number
  averageSolvedProblemRating: number | null
  maxSolvedProblemRating: number | null
}

export interface NormalizedCodeforcesSyncPayload {
  profile: NormalizedCodeforcesProfile
  contestResults: NormalizedCodeforcesContestResult[]
  tagStats: NormalizedCodeforcesTagStat[]
  submissionsArePartial: boolean
}

export interface CodeforcesLinkResult {
  success: true
  provider: CodeforcesProviderKey
  status: 'linked' | 'already_linked' | 'relinked'
  userId: string
  connectedAccountId: string
  username: string
  profileUrl: string
  lastSyncedAt: string | null
  message: string
}
