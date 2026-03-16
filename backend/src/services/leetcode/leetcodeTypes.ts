export type LeetcodeProviderKey = 'leetcode'

export interface LeetcodeGraphqlError {
  message: string
}

export interface LeetcodeGraphqlResponse<T> {
  data?: T
  errors?: LeetcodeGraphqlError[]
}

export interface LeetcodeSubmissionCount {
  difficulty: 'All' | 'Easy' | 'Medium' | 'Hard'
  count: number
  submissions: number
}

export interface LeetcodeTagProblemCount {
  tagName: string
  problemsSolved: number
}

export interface LeetcodeLanguageProblemCount {
  languageName: string
  problemsSolved: number
}

export interface LeetcodeUserCalendar {
  activeYears: number[]
  streak: number
  totalActiveDays: number
}

export interface LeetcodeMatchedUserProfile {
  realName: string | null
  userAvatar: string | null
  ranking: number | null
  reputation: number | null
  aboutMe: string | null
  school: string | null
  countryName: string | null
  company: string | null
  jobTitle: string | null
  skillTags: string[]
}

export interface LeetcodeMatchedUser {
  username: string
  profile: LeetcodeMatchedUserProfile | null
  submitStatsGlobal: {
    acSubmissionNum: LeetcodeSubmissionCount[]
  } | null
  badges: Array<{
    id: string
    displayName: string
    icon: string
  }>
  languageProblemCount: LeetcodeLanguageProblemCount[]
  tagProblemCounts: {
    advanced: LeetcodeTagProblemCount[]
    intermediate: LeetcodeTagProblemCount[]
    fundamental: LeetcodeTagProblemCount[]
  } | null
  userCalendar: LeetcodeUserCalendar | null
}

export interface LeetcodeContestRanking {
  rating: number | null
  globalRanking: number | null
  attendedContestsCount: number | null
  topPercentage: number | null
  totalParticipants: number | null
}

export interface LeetcodeUserSnapshotResponse {
  matchedUser: LeetcodeMatchedUser | null
  userContestRanking: LeetcodeContestRanking | null
}

export interface NormalizedLeetcodeProfile {
  provider: LeetcodeProviderKey
  providerUserId: string
  username: string
  displayName: string | null
  profileUrl: string
  avatarUrl: string | null
  realName: string | null
  aboutMe: string | null
  countryName: string | null
  company: string | null
  school: string | null
  ranking: number | null
  reputation: number | null
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  currentStreak: number
  totalActiveDays: number
  activeYears: number[]
  badgesCount: number
  contestRating: number | null
  contestGlobalRanking: number | null
  contestTopPercentage: number | null
  attendedContestsCount: number | null
}

export interface NormalizedLeetcodeTopicStat {
  category: 'fundamental' | 'intermediate' | 'advanced'
  topicName: string
  problemsSolved: number
}

export interface NormalizedLeetcodeLanguageStat {
  languageName: string
  problemsSolved: number
}

export interface NormalizedLeetcodeSyncPayload {
  profile: NormalizedLeetcodeProfile
  topicStats: NormalizedLeetcodeTopicStat[]
  languageStats: NormalizedLeetcodeLanguageStat[]
}

export interface LeetcodeLinkResult {
  success: true
  provider: LeetcodeProviderKey
  status: 'linked' | 'already_linked' | 'relinked'
  userId: string
  connectedAccountId: string
  username: string
  profileUrl: string
  lastSyncedAt: string | null
  message: string
}
