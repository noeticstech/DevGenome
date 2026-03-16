export interface LeetcodeSyncWarning {
  code: 'contest_data_unavailable'
  message: string
}

export interface LeetcodePersistenceResult {
  topicStatsSynced: number
  languageStatsSynced: number
}

export interface LeetcodeSyncResult {
  success: true
  status: 'completed' | 'completed_with_warnings'
  provider: 'leetcode'
  userId: string
  connectedAccountId: string
  username: string
  profileSynced: true
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  currentStreak: number
  topicStatsSynced: number
  languageStatsSynced: number
  startedAt: string
  completedAt: string
  warnings: LeetcodeSyncWarning[]
}
