export type ProductDataState =
  | 'ready'
  | 'needs_sync'
  | 'needs_analysis'
  | 'partial_data'

export interface AuthenticatedUser {
  id: string
  email: string | null
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
  connectedAccounts: Array<{
    id: string
    provider: 'GITHUB' | 'LEETCODE' | 'CODEFORCES'
    username: string
    profileUrl: string | null
    avatarUrl: string | null
    lastSyncedAt: string | null
  }>
}

export interface AuthMeResponse {
  authenticated: boolean
  user: AuthenticatedUser | null
}

export interface LogoutResponse {
  authenticated: false
  message: string
}

export interface ProductMetaResponse {
  state: ProductDataState
  hasConnectedGithub: boolean
  hasSyncedData: boolean
  hasAnalysis: boolean
  lastSyncAt: string | null
  lastAnalysisAt: string | null
  metadataOnlyAnalysis: boolean
  sourceCodeStorage: 'disabled'
}

export interface ChartDatum {
  key: string
  label: string
  value: number
}

export interface LanguageDistributionDatum {
  language: string
  bytes: number
  percentage: number
}

export interface DashboardResponse {
  meta: ProductMetaResponse
  overview: {
    genomeScore: {
      value: number | null
      statusLabel: string | null
      generatedAt: string | null
    }
    repositories: {
      value: number
      label: string
    }
    languages: {
      value: number
      label: string
    }
    learningVelocity: {
      label: string | null
      value: number | null
    }
  }
  skillRadar: {
    items: ChartDatum[]
    emptyMessage: string | null
  }
  languageDistribution: {
    items: LanguageDistributionDatum[]
    emptyMessage: string | null
  }
  recentActivity: {
    windowStart: string | null
    windowEnd: string | null
    items: Array<{
      repositoryName: string
      fullName: string
      primaryLanguage: string | null
      activityCount: number
      lastUpdatedAt: string | null
      insight: string
    }>
    emptyMessage: string | null
  }
  skillGapTeaser: {
    targetRole: string | null
    readinessScore: number | null
    topMissingSkills: string[]
    actionHint: string | null
  }
  highlights: string[]
}

export interface GenomeResponse {
  meta: ProductMetaResponse
  summary: {
    genomeScore: number | null
    statusLabel: string | null
    subtitle: string | null
    generatedAt: string | null
  }
  skillBreakdown: {
    items: ChartDatum[]
    strongest: string[]
    weakest: string[]
  }
  visualization: {
    radial: ChartDatum[]
    strands: Array<{
      group: string
      items: ChartDatum[]
    }>
    strengths: string[]
    growthAreas: string[]
  }
  archetype: {
    code: string | null
    label: string | null
    explanation: string | null
    dominantSignals: string[]
  }
  careerFit: {
    primary: {
      targetRole: string
      readinessScore: number
      summary: string
    } | null
    secondary: {
      targetRole: string
      readinessScore: number
    } | null
    growthFocus: string[]
  }
  supportingMeta: {
    strongestCategories: string[]
    weakestCategories: string[]
    generatedAt: string | null
  }
}

export interface ActivityResponse {
  meta: ProductMetaResponse
  summary: {
    totalCommitCount: number
    activeRepositories: number
    consistencyLabel: string
    averageWeeklyCommits: number
    windowStart: string | null
    windowEnd: string | null
  }
  heatmap: {
    granularity: 'week'
    items: Array<{
      bucketStart: string
      bucketEnd: string
      commitCount: number
      activeDays: number
      intensity: number
    }>
    emptyMessage: string | null
  }
  languageUsage: {
    items: LanguageDistributionDatum[]
    emptyMessage: string | null
  }
  repositoryContribution: {
    items: Array<{
      repositoryName: string
      fullName: string
      primaryLanguage: string | null
      commitCount: number
      activeWeeks: number
      lastUpdatedAt: string | null
      activityLevel: string
    }>
    emptyMessage: string | null
  }
  insights: Array<{
    title: string
    description: string
    tone: 'positive' | 'neutral'
  }>
  confidenceNote: string | null
}

export interface SkillsResponse {
  meta: ProductMetaResponse
  targetRole: {
    role: string
    readinessScore: number | null
    summary: string | null
  }
  comparison: {
    items: Array<{
      category: string
      label: string
      currentScore: number
      targetScore: number
      gap: number
    }>
  }
  missingSkills: {
    items: Array<{
      skill: string
      priority: 'high' | 'medium' | 'low'
      reason: string
    }>
    emptyMessage: string | null
  }
  learningPath: {
    steps: Array<{
      order: number
      title: string
      description: string
    }>
  }
  suggestedProjects: {
    items: Array<{
      title: string
      focusAreas: string[]
      whyItHelps: string
      impact: 'high' | 'medium'
    }>
  }
  strongAreas: {
    items: Array<{
      label: string
      score: number
      note: string
    }>
  }
}

export interface TimelineResponse {
  meta: ProductMetaResponse
  summary: {
    growthStage: string
    yearsTracked: number
    milestonesCount: number
    stackExpansionCount: number
  }
  events: Array<{
    title: string
    description: string
    eventDate: string
    eventType: string
    iconHint: string
  }>
  technologyJourney: Array<{
    period: string
    technologies: string[]
  }>
  growthMetrics: {
    repositoryGrowth: Array<{
      period: string
      value: number
    }>
    activityGrowth: Array<{
      period: string
      value: number
    }>
    technologyBreadth: Array<{
      period: string
      value: number
    }>
  }
  milestoneHighlights: Array<{
    title: string
    description: string
    eventDate: string
    eventType: string
  }>
  nextEvolution: {
    title: string | null
    description: string | null
    focusAreas: string[]
  }
}

export type ThemePreference = 'SYSTEM' | 'DARK'
export type DashboardLayout = 'DETAILED' | 'COMPACT'
export type ProfileVisibility = 'PRIVATE' | 'TEAM' | 'PUBLIC'

export interface SettingsResponse {
  connectedAccounts: {
    items: Array<{
      provider: 'github' | 'leetcode' | 'codeforces' | 'geeksforgeeks'
      label: string
      status: 'connected' | 'disconnected' | 'coming_soon'
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
    sharing: {
      publicProfileEnabled: boolean
      sharePath: string | null
      revocationStrategy: 'disable_public_profile'
      message: string
    }
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

export interface UpdateSettingsPreferencesPayload {
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

export interface GithubSyncResponse {
  success: true
  status: 'queued' | 'already_queued'
  message: string
  job: BackgroundJobSnapshotResponse
}

export interface GithubAnalyzeResponse {
  success: true
  status: 'queued' | 'already_queued'
  message: string
  job: BackgroundJobSnapshotResponse
}

export interface BackgroundJobSnapshotResponse {
  id: string
  type: 'GITHUB_SYNC' | 'LEETCODE_SYNC' | 'CODEFORCES_SYNC' | 'USER_ANALYSIS'
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  trigger: 'MANUAL' | 'SCHEDULED' | 'CHAINED'
  userId: string
  connectedAccountId: string | null
  sourceJobId: string | null
  attempts: number
  maxAttempts: number
  scheduledFor: string
  startedAt: string | null
  completedAt: string | null
  failedAt: string | null
  createdAt: string
  updatedAt: string
  lastError: string | null
  lastErrorCategory: string | null
  lastErrorCode: string | null
  payloadPresent: boolean
  resultPresent: boolean
}

export interface BackgroundJobFailureResponse {
  message: string
  category: string | null
  code: string | null
  retryable: boolean | null
  occurredAt: string | null
}

export interface BackgroundJobStatusResponse {
  job: BackgroundJobSnapshotResponse
  result: unknown | null
  failure: BackgroundJobFailureResponse | null
}

export interface AiInsightsResponse {
  meta: {
    state: ProductDataState
    availability: 'ready' | 'disabled' | 'needs_sync' | 'needs_analysis'
    provider: 'gemini' | null
    aiConfigured: boolean
    generated: boolean
    model: string | null
    source: 'on_demand'
    generatedAt: string | null
    basedOnAnalysisAt: string | null
  }
  emptyMessage: string | null
  insights: {
    summary: string | null
    genome: {
      narrativeSummary: string | null
      whyThisScore: string | null
      strengths: string[]
      growthEdges: string[]
    }
    skillGap: {
      targetRole: string | null
      explanation: string | null
      priorities: string[]
      recommendations: string[]
    }
    careerFit: {
      primaryFit: string | null
      explanation: string | null
      supportingSignals: string[]
    }
    evolution: {
      narrative: string | null
      growthSignal: string | null
      nextMilestone: string | null
      recommendations: string[]
    }
    report: {
      title: string | null
      overview: string | null
      highlights: string[]
      watchouts: string[]
      nextSteps: string[]
    }
  }
  warnings: string[]
}

export type DeveloperReportType =
  | 'genome_summary'
  | 'monthly_growth'
  | 'skill_gap_action'
  | 'interview_readiness'

export interface DeveloperReportResponse {
  meta: {
    state: ProductDataState
    availability: 'ready' | 'disabled' | 'needs_sync' | 'needs_analysis'
    reportType: DeveloperReportType
    provider: 'gemini' | null
    aiConfigured: boolean
    generated: boolean
    model: string | null
    source: 'on_demand'
    generatedAt: string | null
    basedOnAnalysisAt: string | null
    basedOnSyncAt: string | null
  }
  emptyMessage: string | null
  report: {
    type: DeveloperReportType
    title: string | null
    subtitle: string | null
    summary: string | null
    strengths: string[]
    weakPoints: string[]
    changesOverTime: string[]
    nextSteps: string[]
    metrics: Array<{
      key: string
      label: string
      value: string
      context: string | null
    }>
    sections: Array<{
      key: string
      title: string
      items: string[]
    }>
  }
  warnings: string[]
}

export interface PublicProfileResponse {
  meta: {
    visibility: 'public'
    shared: true
    metadataOnlyAnalysis: boolean
    sourceCodeStorage: 'disabled'
    sharedAt: string
  }
  profile: {
    displayName: string | null
    username: string | null
    avatarUrl: string | null
    bio: string | null
    targetRole: string | null
  }
  overview: {
    genomeScore: number | null
    statusLabel: string | null
    archetypeLabel: string | null
    summary: string | null
    learningVelocity: string | null
  }
  highlights: string[]
  skills: {
    items: ChartDatum[]
    strongest: string[]
    growthAreas: string[]
  }
  languages: {
    items: LanguageDistributionDatum[]
  }
  careerFit: {
    primaryRole: string | null
    readinessScore: number | null
    summary: string | null
    growthFocus: string[]
  }
  timeline: {
    highlights: Array<{
      title: string
      description: string
      eventDate: string
      eventType: string
    }>
    nextEvolution: {
      title: string | null
      description: string | null
      focusAreas: string[]
    }
  }
}

export interface ProfileExportResponse {
  export: {
    kind: 'profile'
    format: 'json'
    exportedAt: string
    schemaVersion: '2026-03-16'
  }
  data: {
    dashboard: DashboardResponse
    genome: GenomeResponse
    activity: ActivityResponse
    skills: SkillsResponse
    timeline: TimelineResponse
  }
}

export interface ReportExportResponse {
  export: {
    kind: 'report'
    format: 'json'
    exportedAt: string
    schemaVersion: '2026-03-16'
    reportType: DeveloperReportType
  }
  data: DeveloperReportResponse
}

export interface LeetcodeLinkResponse {
  success: true
  provider: 'leetcode'
  status: 'linked' | 'already_linked' | 'relinked'
  userId: string
  connectedAccountId: string
  username: string
  profileUrl: string
  lastSyncedAt: string | null
  message: string
}

export interface CodeforcesLinkResponse {
  success: true
  provider: 'codeforces'
  status: 'linked' | 'already_linked' | 'relinked'
  userId: string
  connectedAccountId: string
  username: string
  profileUrl: string
  lastSyncedAt: string | null
  message: string
}
