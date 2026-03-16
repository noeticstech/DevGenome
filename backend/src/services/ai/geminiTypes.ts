import { z } from 'zod'

import type { ProductDataState } from '../../types/api/product'

export type GeminiInsightAvailability =
  | 'ready'
  | 'needs_sync'
  | 'needs_analysis'

export interface GeminiInsightInput {
  user: {
    displayName: string | null
    username: string | null
    targetRole: string
  }
  productState: {
    state: ProductDataState
    hasConnectedGithub: boolean
    hasSyncedData: boolean
    hasAnalysis: boolean
    metadataOnlyAnalysis: boolean
    sourceCodeStorage: 'disabled'
    lastSyncAt: string | null
    lastAnalysisAt: string | null
  }
  genome: {
    overallScore: number
    statusLabel: string
    developerTypeCode: string
    developerTypeLabel: string
    learningVelocity: string
    summary: string | null
    strongestCategories: string[]
    weakestCategories: string[]
    skillScores: Array<{
      key: string
      label: string
      score: number
    }>
    generatedAt: string
  }
  roleFit: {
    preferredRole: string
    readinessScore: number
    summary: string | null
    strongestAreas: string[]
    missingSkills: string[]
    learningSuggestions: string[]
    recommendedProjects: string[]
    alternativeFits: Array<{
      targetRole: string
      readinessScore: number
    }>
  }
  activity: {
    repositoryCount: number
    activeRepositoryCount: number
    languageBreadth: number
    dominantLanguages: string[]
    totalCommitCount: number
    recentCommitCount: number
    totalActiveWeeks: number
    recentActiveWeeks: number
    stackDiversity: number
    experimentationIndex: number
    latestRepositoryAt: string | null
    latestActivityAt: string | null
    recentLanguageAdoptions: string[]
    topLanguages: Array<{
      language: string
      percentage: number
    }>
  }
  competitiveSignals: {
    leetcode: {
      totalSolved: number
      difficultyBreakdown: {
        easy: number
        medium: number
        hard: number
      }
      currentStreak: number
      topicBreadth: number
      contestParticipationCount: number
      contestRating: number | null
    } | null
    codeforces: {
      currentRating: number | null
      maxRating: number | null
      contestCount: number
      recentContestCount: number
      totalSolvedProblems: number
      tagBreadth: number
      averageSolvedProblemRating: number | null
      maxSolvedProblemRating: number | null
    } | null
  }
  timeline: {
    milestoneCount: number
    stackExpansionCount: number
    highlights: Array<{
      title: string
      description: string | null
      eventDate: string
      eventType: string
    }>
  }
  limitations: string[]
}

export interface GeminiInsightSourceData {
  availability: GeminiInsightAvailability
  state: ProductDataState
  basedOnAnalysisAt: Date | null
  basedOnSyncAt: Date | null
  warnings: string[]
  emptyMessage: string | null
  input: GeminiInsightInput | null
}

export interface GeminiInsightModelOutput {
  summary: string
  genome: {
    narrativeSummary: string
    whyThisScore: string
    strengths: string[]
    growthEdges: string[]
  }
  skillGap: {
    targetRole: string
    explanation: string
    priorities: string[]
    recommendations: string[]
  }
  careerFit: {
    primaryFit: string
    explanation: string
    supportingSignals: string[]
  }
  evolution: {
    narrative: string
    growthSignal: string
    nextMilestone: string
    recommendations: string[]
  }
  report: {
    title: string
    overview: string
    highlights: string[]
    watchouts: string[]
    nextSteps: string[]
  }
}

export const GeminiInsightModelOutputSchema: z.ZodType<GeminiInsightModelOutput> =
  z.object({
    summary: z.string(),
    genome: z.object({
      narrativeSummary: z.string(),
      whyThisScore: z.string(),
      strengths: z.array(z.string()),
      growthEdges: z.array(z.string()),
    }),
    skillGap: z.object({
      targetRole: z.string(),
      explanation: z.string(),
      priorities: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    careerFit: z.object({
      primaryFit: z.string(),
      explanation: z.string(),
      supportingSignals: z.array(z.string()),
    }),
    evolution: z.object({
      narrative: z.string(),
      growthSignal: z.string(),
      nextMilestone: z.string(),
      recommendations: z.array(z.string()),
    }),
    report: z.object({
      title: z.string(),
      overview: z.string(),
      highlights: z.array(z.string()),
      watchouts: z.array(z.string()),
      nextSteps: z.array(z.string()),
    }),
  })
