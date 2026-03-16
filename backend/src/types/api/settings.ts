import type {
  DashboardLayout,
  ProfileVisibility,
  ThemePreference,
} from '@prisma/client'

import type { ProductDataState } from '../../services/product/productDataService'

export type SettingsConnectionStatus = 'connected' | 'disconnected' | 'coming_soon'

export interface SettingsResponse {
  connectedAccounts: {
    items: Array<{
      provider: 'github' | 'leetcode' | 'codeforces' | 'geeksforgeeks'
      label: string
      status: SettingsConnectionStatus
      supported: boolean
      username: string | null
      avatarUrl: string | null
      profileUrl: string | null
      lastSyncedAt: string | null
      message: string
      canConnect: boolean
      canDisconnect: boolean
    }>
  }
  profile: {
    displayName: string | null
    username: string | null
    avatarUrl: string | null
    targetRole: string | null
  }
  appearance: {
    theme: ThemePreference
    accentColor: string
    dashboardLayout: DashboardLayout
    compactDashboardEnabled: boolean
    genomeScoreHeatmapEnabled: boolean
  }
  notifications: {
    weeklySummaryEnabled: boolean
    learningProgressEnabled: boolean
    skillGapAlertsEnabled: boolean
    productUpdatesEnabled: boolean
  }
  privacy: {
    profileVisibility: ProfileVisibility
    metadataOnlyAnalysis: boolean
    sourceCodeStorage: {
      status: 'disabled'
      message: string
    }
  }
  account: {
    state: ProductDataState
    accountCreatedAt: string
    lastSyncAt: string | null
    lastAnalysisAt: string | null
    connectedProviderCount: number
    repositoryCount: number
    languageCount: number
  }
}

export interface UpdateSettingsPreferencesResponse {
  success: true
  message: string
  settings: SettingsResponse
}

export interface DisconnectGithubResponse {
  success: true
  status: 'disconnected' | 'already_disconnected'
  disconnectedProvider: 'github'
  sessionCleared: boolean
  retainedDataSummary: {
    historyRetained: boolean
    repositoryCount: number
    analysisRecords: number
  }
  message: string
  nextStep: string
}

export interface DeleteSettingsHistoryResponse {
  success: true
  status: 'history_deleted' | 'no_history'
  message: string
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

export interface DeleteAccountResponse {
  success: true
  status: 'account_deleted'
  sessionCleared: boolean
  message: string
}
