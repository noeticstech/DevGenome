import type { DeveloperArchetypeResult, DerivedAnalysisSignals, GenomeScoreResult, LearningVelocityResult, SkillScoringResult } from './analysisTypes'
import { average, clampScore, pickStrongestCoreCategories, scaleToRange } from './analysisUtils'
import type { FusedAnalysisSignals } from './fusion/fusionTypes'

export function calculateGenomeScore(input: {
  signals: DerivedAnalysisSignals
  skillScores: SkillScoringResult
  developerType: DeveloperArchetypeResult
  learningVelocity: LearningVelocityResult
  fusion: FusedAnalysisSignals
}): GenomeScoreResult {
  const coreScoreValues = [
    input.skillScores.scores.algorithms.score,
    input.skillScores.scores.backend.score,
    input.skillScores.scores.frontend.score,
    input.skillScores.scores.databases.score,
    input.skillScores.scores.devops.score,
    input.skillScores.scores.systemDesign.score,
  ]

  const breadth = clampScore(
    12 +
      scaleToRange(input.signals.totalRepositories, 12, 28) +
      scaleToRange(input.signals.languageBreadth, 10, 26) +
      scaleToRange(input.signals.stackDiversity, 6, 22),
  )

  const consistency = clampScore(
    10 +
      scaleToRange(input.signals.recentActiveWeeks, 12, 34) +
      scaleToRange(input.signals.recentCommitCount, 80, 28) +
      scaleToRange(input.signals.activeRepositoryCount, 6, 18),
  )

  const depth = clampScore(
    average(coreScoreValues) * 0.72 +
      scaleToRange(input.signals.totalStars, 30, 8) +
      scaleToRange(input.signals.multiCategoryRepositoryCount, 5, 10) +
      scaleToRange(input.fusion.interviewReadiness.score, 100, 4),
  )

  const recency = clampScore(
    12 +
      scaleToRange(input.signals.recentRepositoryCount, 6, 34) +
      scaleToRange(input.signals.activeRepositoryCount, 6, 18) +
      (input.signals.latestActivityAt
        ? scaleToRange(Math.max(120 - Math.floor((input.signals.generatedAt.getTime() - input.signals.latestActivityAt.getTime()) / (24 * 60 * 60 * 1000)), 0), 120, 18)
        : 0),
  )

  const growth = clampScore(input.learningVelocity.score)

  const overallScore = clampScore(
    breadth * 0.22 +
      consistency * 0.2 +
      depth * 0.28 +
      recency * 0.15 +
      growth * 0.15,
  )

  const strongestCoreAreas = pickStrongestCoreCategories(
    {
      algorithms: input.skillScores.scores.algorithms.score,
      backend: input.skillScores.scores.backend.score,
      frontend: input.skillScores.scores.frontend.score,
      databases: input.skillScores.scores.databases.score,
      devops: input.skillScores.scores.devops.score,
      systemDesign: input.skillScores.scores.systemDesign.score,
    },
    2,
  )

  return {
    overallScore,
    componentScores: {
      breadth,
      consistency,
      depth,
      recency,
      growth,
    },
    explanation:
      'The genome score blends stack breadth, repository consistency, inferred skill depth, recent activity, and learning momentum using metadata-only analysis. When multiple providers are connected, direct practice signals can strengthen depth without replacing the rule-based core.',
    summary: `${input.developerType.label} profile with strongest signals in ${strongestCoreAreas.join(' and ')}. Score is based on ${input.signals.totalRepositories} synced repositories, ${input.signals.languageBreadth} detected languages, and fused multi-source evidence when available rather than source code inspection.`,
  }
}
