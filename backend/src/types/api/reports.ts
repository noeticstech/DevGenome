import type { ProductDataState } from './product'

export type DeveloperReportType =
  | 'genome_summary'
  | 'monthly_growth'
  | 'skill_gap_action'
  | 'interview_readiness'

export type DeveloperReportAvailability =
  | 'ready'
  | 'disabled'
  | 'needs_sync'
  | 'needs_analysis'

export interface DeveloperReportResponse {
  meta: {
    state: ProductDataState
    availability: DeveloperReportAvailability
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
