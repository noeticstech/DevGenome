export type ProductDataState =
  | 'ready'
  | 'needs_sync'
  | 'needs_analysis'
  | 'partial_data'

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
