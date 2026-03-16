import type { AnalysisSkillCategory, AnalysisSource, DerivedAnalysisSignals } from '../analysisTypes'
import { clampScore, scaleToRange } from '../analysisUtils'
import { buildSourceSignals } from './sourceSignals'
import type {
  FusedAnalysisSignals,
  FusedDimension,
  SourceSignalDimension,
  SourceSignals,
} from './fusionTypes'

type SourceInput = {
  source: AnalysisSource
  weight: number
  include: boolean
  dimension: SourceSignalDimension
}

type FuseOptions = {
  confirmThreshold?: number
  confirmationBonus?: number
  allowConfirmation?: boolean
}

function humanizeSource(source: AnalysisSource) {
  const labels: Record<AnalysisSource, string> = {
    github: 'GitHub',
    leetcode: 'LeetCode',
    codeforces: 'Codeforces',
  }

  return labels[source]
}

function buildSourceContributionRecord(
  source: AnalysisSource,
  score: number,
  weight: number,
  note: string,
) {
  return {
    source,
    score: clampScore(score, 0, 100),
    weight: Number(weight.toFixed(2)),
    note,
  }
}

function fuseDimension(
  label: string,
  inputs: SourceInput[],
  options: FuseOptions = {},
): FusedDimension {
  const includedInputs = inputs.filter((input) => input.include)

  if (includedInputs.length === 0) {
    return {
      score: 0,
      confidence: 0,
      explanation: [`${label} has no meaningful synced provider evidence yet.`],
      contributions: [],
    }
  }

  const totalWeight = includedInputs.reduce((sum, input) => sum + input.weight, 0)

  const contributions = includedInputs.map((input) => {
    const normalizedWeight = totalWeight === 0 ? 0 : input.weight / totalWeight

    return buildSourceContributionRecord(
      input.source,
      input.dimension.score,
      normalizedWeight,
      input.dimension.note,
    )
  })

  const baseScore = contributions.reduce(
    (sum, contribution) => sum + contribution.score * contribution.weight,
    0,
  )

  const confirmThreshold = options.confirmThreshold ?? 48
  const confirmationBonus = options.allowConfirmation === false
    ? 0
    : scaleToRange(
        Math.max(
          contributions.filter((contribution) => contribution.score >= confirmThreshold).length - 1,
          0,
        ),
        2,
        options.confirmationBonus ?? 6,
      )

  const sortedContributions = [...contributions].sort((left, right) => {
    const rightWeighted = right.score * right.weight
    const leftWeighted = left.score * left.weight

    return rightWeighted - leftWeighted
  })

  const explanation = sortedContributions
    .slice(0, 2)
    .map(
      (contribution) =>
        `${humanizeSource(contribution.source)} contributes ${Math.round(contribution.weight * 100)}% of the weighted evidence. ${contribution.note}`,
    )

  if (confirmationBonus > 0) {
    explanation.push(
      'Multiple sources point in the same direction, so the fused score gets a small confidence lift without double-counting the same signal.',
    )
  }

  return {
    score: clampScore(baseScore + confirmationBonus, 0, 100),
    confidence: clampScore(
      28 +
        scaleToRange(includedInputs.length, 3, 18) +
        scaleToRange(baseScore, 100, 18) +
        scaleToRange(confirmationBonus, options.confirmationBonus ?? 6, 12),
      0,
      100,
    ),
    explanation,
    contributions: sortedContributions,
  }
}

function buildCategorySignals(sourceSignals: SourceSignals) {
  return {
    algorithms: fuseDimension(
      'Algorithms',
      [
        {
          source: 'github',
          weight: 0.18,
          include: sourceSignals.github.available,
          dimension: sourceSignals.github.algorithms,
        },
        {
          source: 'leetcode',
          weight: 0.36,
          include: sourceSignals.leetcode.available,
          dimension: sourceSignals.leetcode.algorithms,
        },
        {
          source: 'codeforces',
          weight: 0.46,
          include: sourceSignals.codeforces.available,
          dimension: sourceSignals.codeforces.algorithms,
        },
      ],
      {
        confirmThreshold: 50,
        confirmationBonus: 8,
      },
    ),
    backend: fuseDimension(
      'Backend',
      [
        {
          source: 'github',
          weight: 1,
          include: sourceSignals.github.available,
          dimension: sourceSignals.github.backend,
        },
      ],
      { allowConfirmation: false },
    ),
    frontend: fuseDimension(
      'Frontend',
      [
        {
          source: 'github',
          weight: 1,
          include: sourceSignals.github.available,
          dimension: sourceSignals.github.frontend,
        },
      ],
      { allowConfirmation: false },
    ),
    databases: fuseDimension(
      'Databases',
      [
        {
          source: 'github',
          weight: 1,
          include: sourceSignals.github.available,
          dimension: sourceSignals.github.databases,
        },
      ],
      { allowConfirmation: false },
    ),
    devops: fuseDimension(
      'DevOps',
      [
        {
          source: 'github',
          weight: 1,
          include: sourceSignals.github.available,
          dimension: sourceSignals.github.devops,
        },
      ],
      { allowConfirmation: false },
    ),
    systemDesign: fuseDimension(
      'System design',
      [
        {
          source: 'github',
          weight: 1,
          include: sourceSignals.github.available,
          dimension: sourceSignals.github.systemDesign,
        },
      ],
      { allowConfirmation: false },
    ),
    security: fuseDimension(
      'Security',
      [
        {
          source: 'github',
          weight: 1,
          include: sourceSignals.github.available,
          dimension: sourceSignals.github.security,
        },
      ],
      { allowConfirmation: false },
    ),
    collaboration: fuseDimension(
      'Collaboration',
      [
        {
          source: 'github',
          weight: 1,
          include: sourceSignals.github.available,
          dimension: sourceSignals.github.collaboration,
        },
      ],
      { allowConfirmation: false },
    ),
  } satisfies Record<AnalysisSkillCategory, FusedDimension>
}

export function getTopContributingSources(
  dimension: FusedDimension,
  limit = 2,
): AnalysisSource[] {
  return dimension.contributions.slice(0, limit).map((contribution) => contribution.source)
}

export function getInterviewReadinessLabel(score: number) {
  if (score >= 80) {
    return 'advanced'
  }

  if (score >= 62) {
    return 'strong'
  }

  if (score >= 42) {
    return 'developing'
  }

  return 'emerging'
}

export function buildFusedAnalysisSignals(
  signals: DerivedAnalysisSignals,
): FusedAnalysisSignals {
  const sourceSignals = buildSourceSignals(signals)
  const categorySignals = buildCategorySignals(sourceSignals)

  const builderStrength = fuseDimension(
    'Builder archetype strength',
    [
      {
        source: 'github',
        weight: 1,
        include: sourceSignals.github.available,
        dimension: sourceSignals.github.projectExecution,
      },
    ],
    { allowConfirmation: false },
  )

  const problemSolvingStrength = fuseDimension(
    'Problem-solving strength',
    [
      {
        source: 'github',
        weight: 0.12,
        include: sourceSignals.github.available,
        dimension: sourceSignals.github.problemSolving,
      },
      {
        source: 'leetcode',
        weight: 0.41,
        include: sourceSignals.leetcode.available,
        dimension: sourceSignals.leetcode.problemSolving,
      },
      {
        source: 'codeforces',
        weight: 0.47,
        include: sourceSignals.codeforces.available,
        dimension: sourceSignals.codeforces.problemSolving,
      },
    ],
    {
      confirmThreshold: 50,
      confirmationBonus: 8,
    },
  )

  const explorationStrength = fuseDimension(
    'Exploration strength',
    [
      {
        source: 'github',
        weight: 0.72,
        include: sourceSignals.github.available,
        dimension: sourceSignals.github.exploration,
      },
      {
        source: 'leetcode',
        weight: 0.18,
        include: sourceSignals.leetcode.available,
        dimension: sourceSignals.leetcode.exploration,
      },
      {
        source: 'codeforces',
        weight: 0.1,
        include: sourceSignals.codeforces.available,
        dimension: sourceSignals.codeforces.exploration,
      },
    ],
    {
      confirmThreshold: 46,
      confirmationBonus: 5,
    },
  )

  const interviewReadiness = fuseDimension(
    'Interview readiness',
    [
      {
        source: 'github',
        weight: 0.38,
        include: sourceSignals.github.available,
        dimension: sourceSignals.github.interview,
      },
      {
        source: 'leetcode',
        weight: 0.26,
        include: sourceSignals.leetcode.available,
        dimension: sourceSignals.leetcode.interview,
      },
      {
        source: 'codeforces',
        weight: 0.36,
        include: sourceSignals.codeforces.available,
        dimension: sourceSignals.codeforces.interview,
      },
    ],
    {
      confirmThreshold: 52,
      confirmationBonus: 6,
    },
  )

  const growthMomentum = fuseDimension(
    'Growth momentum',
    [
      {
        source: 'github',
        weight: 0.54,
        include: sourceSignals.github.available,
        dimension: sourceSignals.github.growth,
      },
      {
        source: 'leetcode',
        weight: 0.16,
        include: sourceSignals.leetcode.available,
        dimension: sourceSignals.leetcode.growth,
      },
      {
        source: 'codeforces',
        weight: 0.3,
        include: sourceSignals.codeforces.available,
        dimension: sourceSignals.codeforces.growth,
      },
    ],
    {
      confirmThreshold: 44,
      confirmationBonus: 5,
    },
  )

  return {
    sourceSignals,
    categorySignals,
    builderStrength,
    problemSolvingStrength,
    explorationStrength,
    interviewReadiness,
    growthMomentum,
    sourceCoverage: {
      connectedSources: (['github', 'leetcode', 'codeforces'] as AnalysisSource[]).filter(
        (source) => sourceSignals[source].available,
      ),
      problemSolvingSources: getTopContributingSources(problemSolvingStrength, 3),
    },
  }
}
