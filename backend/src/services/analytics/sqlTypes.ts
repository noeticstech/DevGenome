export interface SqlLanguageCountRecord {
  languageCount: number
}

export interface SqlLanguageDistributionRecord {
  language: string
  bytes: number
  percentage: number
}

export interface SqlWeeklyCommitSeriesRecord {
  bucketStart: Date
  bucketEnd: Date
  commitCount: number
  activeDays: number
}

export interface SqlRepositoryActivitySummaryRecord {
  repositoryName: string
  fullName: string
  primaryLanguage: string | null
  lastUpdatedAt: Date | null
  lastPushedAt: Date | null
  starsCount: number
  commitCount: number
  activeWeeks: number
}

export interface SqlPeriodMetricRecord {
  period: string
  value: number
}

export interface SqlTechnologyJourneyRecord {
  period: string
  technologies: string[]
}

export interface SqlTimelineAnalyticsRecord {
  repositoryGrowth: SqlPeriodMetricRecord[]
  activityGrowth: SqlPeriodMetricRecord[]
  technologyBreadth: SqlPeriodMetricRecord[]
  technologyJourney: SqlTechnologyJourneyRecord[]
}
