import type { AnalysisSource, AnalysisSourceContribution } from '../analysisTypes'
import { clampScore } from '../analysisUtils'
import type { FusedAnalysisSignals, FusedDimension } from './fusionTypes'

type RoleFusionProfile = {
  builderWeight: number
  interviewWeight: number
  problemSolvingWeight: number
  growthWeight: number
  maxAdjustment: number
}

export type RoleFusionSummary = {
  fusionScore: number
  adjustment: number
  leadingSources: AnalysisSource[]
  explanation: string
  sourceContributions: AnalysisSourceContribution[]
}

const ROLE_FUSION_PROFILES: Record<string, RoleFusionProfile> = {
  'Frontend Developer': {
    builderWeight: 0.5,
    interviewWeight: 0.2,
    problemSolvingWeight: 0.1,
    growthWeight: 0.2,
    maxAdjustment: 5,
  },
  'Backend Developer': {
    builderWeight: 0.38,
    interviewWeight: 0.24,
    problemSolvingWeight: 0.24,
    growthWeight: 0.14,
    maxAdjustment: 7,
  },
  'Full Stack Developer': {
    builderWeight: 0.42,
    interviewWeight: 0.2,
    problemSolvingWeight: 0.16,
    growthWeight: 0.22,
    maxAdjustment: 6,
  },
  'DevOps Engineer': {
    builderWeight: 0.46,
    interviewWeight: 0.12,
    problemSolvingWeight: 0.08,
    growthWeight: 0.34,
    maxAdjustment: 5,
  },
  'Software Engineer': {
    builderWeight: 0.26,
    interviewWeight: 0.28,
    problemSolvingWeight: 0.28,
    growthWeight: 0.18,
    maxAdjustment: 8,
  },
}

function humanizeSource(source: AnalysisSource) {
  const labels: Record<AnalysisSource, string> = {
    github: 'GitHub',
    leetcode: 'LeetCode',
    codeforces: 'Codeforces',
  }

  return labels[source]
}

function collectWeightedSourceContributions(input: Array<{
  weight: number
  dimension: FusedDimension
}>): AnalysisSourceContribution[] {
  const totals = new Map<
    AnalysisSource,
    { score: number; weight: number; notes: string[] }
  >()

  for (const entry of input) {
    for (const contribution of entry.dimension.contributions) {
      const weightedShare = contribution.weight * entry.weight
      const current = totals.get(contribution.source) ?? {
        score: 0,
        weight: 0,
        notes: [],
      }

      current.score += contribution.score * weightedShare
      current.weight += weightedShare

      if (current.notes.length < 2 && contribution.note) {
        current.notes.push(contribution.note)
      }

      totals.set(contribution.source, current)
    }
  }

  return [...totals.entries()]
    .map(([source, total]) => ({
      source,
      score:
        total.weight > 0
          ? clampScore(Math.round(total.score / total.weight), 0, 100)
          : 0,
      weight: Number(total.weight.toFixed(2)),
      note: total.notes[0] ?? `${humanizeSource(source)} contributed to the fused role-fit signal.`,
    }))
    .sort((left, right) => right.weight - left.weight)
}

export function calculateRoleFusionSummary(
  targetRole: string,
  fusion: FusedAnalysisSignals,
): RoleFusionSummary {
  const profile = ROLE_FUSION_PROFILES[targetRole] ?? ROLE_FUSION_PROFILES['Software Engineer']

  const dimensions = [
    { weight: profile.builderWeight, dimension: fusion.builderStrength },
    { weight: profile.interviewWeight, dimension: fusion.interviewReadiness },
    { weight: profile.problemSolvingWeight, dimension: fusion.problemSolvingStrength },
    { weight: profile.growthWeight, dimension: fusion.growthMomentum },
  ]

  const fusionScore = clampScore(
    Math.round(
      dimensions.reduce(
        (total, entry) => total + entry.dimension.score * entry.weight,
        0,
      ),
    ),
    0,
    100,
  )

  const adjustment = Math.round(
    ((fusionScore - 50) / 50) * profile.maxAdjustment,
  )

  const sourceContributions = collectWeightedSourceContributions(dimensions)
  const leadingSources = sourceContributions
    .slice(0, 3)
    .map((contribution) => contribution.source)

  const leadingLabel = leadingSources.length
    ? leadingSources.map((source) => humanizeSource(source)).join(' and ')
    : 'current synced metadata'

  const explanation =
    adjustment >= 3
      ? `${leadingLabel} strengthen ${targetRole} role fit beyond category scores alone by reinforcing delivery, problem-solving, or interview readiness from multiple angles.`
      : adjustment <= -3
        ? `${targetRole} role fit stays conservative because the current fused builder and problem-solving signals from ${leadingLabel} are still limited or uneven.`
        : `${leadingLabel} provide a balanced secondary check on ${targetRole} readiness without overpowering the core category scores.`

  return {
    fusionScore,
    adjustment,
    leadingSources,
    explanation,
    sourceContributions,
  }
}
