export interface CodeforcesSyncWarning {
  code: 'submission_history_partial'
  message: string
}

export interface CodeforcesPersistenceResult {
  contestsSynced: number
  tagStatsSynced: number
}

export interface CodeforcesSyncResult {
  success: true
  status: 'completed' | 'completed_with_warnings'
  provider: 'codeforces'
  userId: string
  connectedAccountId: string
  username: string
  profileSynced: true
  currentRating: number | null
  maxRating: number | null
  totalContests: number
  totalSolvedProblems: number
  recentAcceptedProblems: number
  contestsSynced: number
  tagStatsSynced: number
  startedAt: string
  completedAt: string
  warnings: CodeforcesSyncWarning[]
}
