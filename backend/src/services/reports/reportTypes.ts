import { z } from 'zod'

import type { DeveloperReportAvailability, DeveloperReportType } from '../../types/api/reports'
import type { GeminiInsightInput } from '../ai/geminiTypes'

export const SUPPORTED_DEVELOPER_REPORT_TYPES = [
  'genome_summary',
  'monthly_growth',
  'skill_gap_action',
  'interview_readiness',
] as const satisfies readonly DeveloperReportType[]

export const DeveloperReportTypeSchema = z.enum(SUPPORTED_DEVELOPER_REPORT_TYPES)

export interface DeveloperReportTemplate {
  type: DeveloperReportType
  label: string
  subtitle: string
  goal: string
  focusAreas: string[]
}

export const REPORT_TEMPLATES: Record<DeveloperReportType, DeveloperReportTemplate> = {
  genome_summary: {
    type: 'genome_summary',
    label: 'Genome Summary Report',
    subtitle: 'A structured reading of the current DevGenome profile.',
    goal: 'Explain the current identity, strongest strengths, weakest edges, and what the overall score means.',
    focusAreas: ['genome', 'archetype', 'skill strengths', 'growth edges'],
  },
  monthly_growth: {
    type: 'monthly_growth',
    label: 'Monthly Growth Report',
    subtitle: 'A recent-window growth summary grounded in current stored signals.',
    goal: 'Explain what changed recently, what momentum exists, and where growth appears to be accelerating or flattening.',
    focusAreas: ['recent change', 'activity trend', 'stack expansion', 'competitive-practice movement'],
  },
  skill_gap_action: {
    type: 'skill_gap_action',
    label: 'Skill Gap Action Report',
    subtitle: 'A focused role-readiness report with practical next actions.',
    goal: 'Explain the preferred-role fit, identify the highest-priority gaps, and propose an actionable learning plan.',
    focusAreas: ['role fit', 'missing skills', 'recommended projects', 'learning plan'],
  },
  interview_readiness: {
    type: 'interview_readiness',
    label: 'Interview Readiness Report',
    subtitle: 'A fused view of problem-solving readiness across projects and practice platforms.',
    goal: 'Explain current interview-readiness, especially algorithms and systems signals, without overstating certainty.',
    focusAreas: ['problem solving', 'algorithms', 'systems evidence', 'interview practice'],
  },
}

export interface DeveloperReportMetricInput {
  key: string
  label: string
  value: string
  context: string | null
}

export interface DeveloperReportInput {
  reportType: DeveloperReportType
  template: DeveloperReportTemplate
  user: GeminiInsightInput['user']
  productState: GeminiInsightInput['productState']
  genome: GeminiInsightInput['genome']
  roleFit: GeminiInsightInput['roleFit']
  activity: GeminiInsightInput['activity']
  competitiveSignals: GeminiInsightInput['competitiveSignals']
  timeline: GeminiInsightInput['timeline']
  fusion: {
    interviewReadiness: {
      score: number
      label: string
      topSources: string[]
      explanation: string[]
    }
    growthMomentum: {
      score: number
      topSources: string[]
      explanation: string[]
    }
    problemSolving: {
      score: number
      topSources: string[]
      explanation: string[]
    }
  }
  changes: {
    repositoryCreations: {
      recent: number
      prior: number
    }
    commitActivity: {
      recent: number
      prior: number
    }
    activeWeeks: {
      recent: number
      prior: number
    }
    newLanguageAdoptions: string[]
    recentCompetitiveSignals: string[]
  }
  deterministicMetrics: DeveloperReportMetricInput[]
  deterministicHighlights: string[]
  limitations: string[]
}

export interface DeveloperReportSourceData {
  availability: DeveloperReportAvailability
  state: GeminiInsightInput['productState']['state']
  basedOnAnalysisAt: Date | null
  basedOnSyncAt: Date | null
  warnings: string[]
  emptyMessage: string | null
  input: DeveloperReportInput | null
}

export interface DeveloperReportModelOutput {
  title: string
  subtitle: string
  summary: string
  strengths: string[]
  weakPoints: string[]
  changesOverTime: string[]
  nextSteps: string[]
  metrics: Array<{
    key: string
    label: string
    value: string
    context: string
  }>
  sections: Array<{
    key: string
    title: string
    items: string[]
  }>
}

export const DeveloperReportModelOutputSchema: z.ZodType<DeveloperReportModelOutput> =
  z.object({
    title: z.string(),
    subtitle: z.string(),
    summary: z.string(),
    strengths: z.array(z.string()),
    weakPoints: z.array(z.string()),
    changesOverTime: z.array(z.string()),
    nextSteps: z.array(z.string()),
    metrics: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        value: z.string(),
        context: z.string(),
      }),
    ),
    sections: z.array(
      z.object({
        key: z.string(),
        title: z.string(),
        items: z.array(z.string()),
      }),
    ),
  })
