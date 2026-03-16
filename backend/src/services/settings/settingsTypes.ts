import type {
  DashboardLayout,
  ProfileVisibility,
  ThemePreference,
} from '@prisma/client'

export interface SettingsGithubAccountRecord {
  username: string
  profileUrl: string | null
  avatarUrl: string | null
  lastSyncedAt: Date | null
  disconnectedAt: Date | null
}

export interface SettingsLeetcodeAccountRecord {
  username: string
  profileUrl: string | null
  avatarUrl: string | null
  lastSyncedAt: Date | null
  disconnectedAt: Date | null
}

export interface SettingsCodeforcesAccountRecord {
  username: string
  profileUrl: string | null
  avatarUrl: string | null
  lastSyncedAt: Date | null
  disconnectedAt: Date | null
}

export interface SettingsSnapshot {
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  createdAt: Date
  targetRole: string | null
  theme: ThemePreference
  accentColor: string
  dashboardLayout: DashboardLayout
  compactDashboardEnabled: boolean
  genomeScoreHeatmapEnabled: boolean
  weeklySummaryEnabled: boolean
  learningProgressEnabled: boolean
  skillGapAlertsEnabled: boolean
  productUpdatesEnabled: boolean
  profileVisibility: ProfileVisibility
  profileShareToken: string | null
  metadataOnlyAnalysis: boolean
  sourceCodeStorageDisabled: boolean
  githubAccount: SettingsGithubAccountRecord | null
  leetcodeAccount: SettingsLeetcodeAccountRecord | null
  codeforcesAccount: SettingsCodeforcesAccountRecord | null
  connectedProviderCount: number
  lastSyncAt: Date | null
}

export interface SettingsPreferenceUpdateInput {
  displayName?: string | null
  targetRole?: string | null
  theme?: ThemePreference
  accentColor?: string
  dashboardLayout?: DashboardLayout
  compactDashboardEnabled?: boolean
  genomeScoreHeatmapEnabled?: boolean
  weeklySummaryEnabled?: boolean
  learningProgressEnabled?: boolean
  skillGapAlertsEnabled?: boolean
  productUpdatesEnabled?: boolean
  profileVisibility?: ProfileVisibility
  metadataOnlyAnalysis?: true
}

export interface GithubDisconnectResult {
  status: 'disconnected' | 'already_disconnected'
  repositoryCount: number
  analysisRecords: number
}

export interface HistoryDeletionResult {
  status: 'history_deleted' | 'no_history'
  deletedCounts: {
    repositories: number
    languageStats: number
    commitSummaries: number
    leetcodeProfiles: number
    leetcodeTopicStats: number
    leetcodeLanguageStats: number
    codeforcesProfiles: number
    codeforcesContestResults: number
    codeforcesTagStats: number
    genomeProfiles: number
    skillGapReports: number
    timelineEvents: number
  }
}
