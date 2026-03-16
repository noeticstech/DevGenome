import type {
  ActivityResponse,
  ChartDatum,
  DashboardResponse,
  GenomeResponse,
  LanguageDistributionDatum,
  SkillsResponse,
  TimelineResponse,
} from './product'
import type { DeveloperReportResponse, DeveloperReportType } from './reports'

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
