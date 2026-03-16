import type { ProductDataState } from './product'

export type AiInsightAvailability =
  | 'ready'
  | 'disabled'
  | 'needs_sync'
  | 'needs_analysis'

export interface AiInsightsResponse {
  meta: {
    state: ProductDataState
    availability: AiInsightAvailability
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
