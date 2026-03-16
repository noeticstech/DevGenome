import { DeveloperType } from '@prisma/client'

import type {
  AnalysisSource,
  DeveloperArchetypeResult,
  DerivedAnalysisSignals,
  SkillScoringResult,
} from './analysisTypes'
import { clampScore, humanizeCategory, scaleToRange } from './analysisUtils'
import { getTopContributingSources } from './fusion/fusionEngine'
import type { FusedAnalysisSignals, FusedDimension } from './fusion/fusionTypes'

function getCoreScoreValue(skillScores: SkillScoringResult, key: keyof SkillScoringResult['scores']) {
  return skillScores.scores[key].score
}

function humanizeSource(source: AnalysisSource) {
  const labels: Record<AnalysisSource, string> = {
    github: 'GitHub',
    leetcode: 'LeetCode',
    codeforces: 'Codeforces',
  }

  return labels[source]
}

function buildSourceContributions(dimension: FusedDimension) {
  return dimension.contributions.slice(0, 3)
}

function summarizeProblemSolvingSources(fusion: FusedAnalysisSignals) {
  const topSources = getTopContributingSources(fusion.problemSolvingStrength, 2)

  if (topSources.length === 0) {
    return 'Problem-solving evidence is still mostly inferred from repository metadata.'
  }

  if (topSources.length === 1) {
    return `${humanizeSource(topSources[0])} is the clearest current source of direct problem-solving evidence.`
  }

  return `${humanizeSource(topSources[0])} and ${humanizeSource(topSources[1])} both contribute direct problem-solving evidence, which raises confidence over single-source inference.`
}

export function classifyDeveloperArchetype(
  signals: DerivedAnalysisSignals,
  skillScores: SkillScoringResult,
  fusion: FusedAnalysisSignals,
): DeveloperArchetypeResult {
  const hybridBuilderBonus =
    fusion.builderStrength.score >= 70 && fusion.problemSolvingStrength.score >= 68
      ? 5
      : 0
  const architectFusionBonus = clampScore(
    scaleToRange(fusion.builderStrength.score, 100, 6) +
      scaleToRange(fusion.problemSolvingStrength.score, 100, 4),
    0,
    10,
  )
  const problemSolverFusionBonus = clampScore(
    scaleToRange(fusion.builderStrength.score, 100, 5) +
      (fusion.sourceCoverage.problemSolvingSources.length > 1 ? 4 : 0),
    0,
    10,
  )
  const explorationFusionBonus = clampScore(
    scaleToRange(fusion.sourceCoverage.connectedSources.length, 3, 6),
    0,
    6,
  )

  const builderScore = clampScore(
    16 +
      fusion.builderStrength.score * 0.58 +
      fusion.interviewReadiness.score * 0.06 +
      scaleToRange(
        getCoreScoreValue(skillScores, 'frontend') +
          getCoreScoreValue(skillScores, 'backend') +
          getCoreScoreValue(skillScores, 'databases'),
        240,
        12,
      ) +
      scaleToRange(signals.recentCommitCount, 80, 8) +
      hybridBuilderBonus,
  )

  const architectScore = clampScore(
    18 +
      getCoreScoreValue(skillScores, 'backend') * 0.24 +
      getCoreScoreValue(skillScores, 'systemDesign') * 0.26 +
      getCoreScoreValue(skillScores, 'devops') * 0.16 +
      getCoreScoreValue(skillScores, 'databases') * 0.14 +
      scaleToRange(signals.nonForkRepositoryCount, 8, 8) +
      scaleToRange(signals.totalStars, 25, 6) +
      architectFusionBonus,
  )

  const problemSolverScore = clampScore(
    14 +
      fusion.problemSolvingStrength.score * 0.56 +
      fusion.interviewReadiness.score * 0.18 +
      getCoreScoreValue(skillScores, 'algorithms') * 0.14 +
      scaleToRange(signals.totalActiveWeeks, 16, 8) +
      scaleToRange(getCoreScoreValue(skillScores, 'systemDesign'), 100, 6) +
      problemSolverFusionBonus,
  )

  const explorerScore = clampScore(
    18 +
      fusion.explorationStrength.score * 0.6 +
      scaleToRange(signals.recentRepositoryCount, 6, 10) +
      scaleToRange(signals.experimentationIndex, 20, 10) +
      explorationFusionBonus,
  )

  const fitScores: Record<DeveloperType, number> = {
    [DeveloperType.BUILDER]: builderScore,
    [DeveloperType.ARCHITECT]: architectScore,
    [DeveloperType.PROBLEM_SOLVER]: problemSolverScore,
    [DeveloperType.EXPLORER]: explorerScore,
  }

  const rankedTypes = Object.entries(fitScores).sort((left, right) => right[1] - left[1])
  const developerType = rankedTypes[0][0] as DeveloperType

  if (developerType === DeveloperType.BUILDER) {
    return {
      developerType,
      label: 'The Builder',
      explanation:
        fusion.problemSolvingStrength.score >= 70
          ? 'This profile leans toward shipping practical projects, with stronger-than-usual direct problem-solving reinforcement from linked practice platforms.'
          : 'This profile leans toward building and shipping practical projects across an active repository set.',
      dominantSignals: [
        `${signals.totalRepositories} repositories provide clear project-building evidence.`,
        `${signals.activeRepositoryCount} repositories show recent shipping or update signals.`,
        fusion.problemSolvingStrength.score >= 70
          ? summarizeProblemSolvingSources(fusion)
          : `${signals.multiCategoryRepositoryCount} repositories span multiple technical layers.`,
      ],
      fitScores,
      sourceContributions: buildSourceContributions(fusion.builderStrength),
    }
  }

  if (developerType === DeveloperType.ARCHITECT) {
    return {
      developerType,
      label: 'The Architect',
      explanation:
        'This profile shows a stronger lean toward backend, systems, and infrastructure-oriented work.',
      dominantSignals: [
        `${humanizeCategory('backend')} and ${humanizeCategory('systemDesign')} are among the strongest inferred skill areas.`,
        `${signals.systemDesignProjectCount} repositories show architecture or multi-layer system signals.`,
        fusion.problemSolvingStrength.score >= 62
          ? `${signals.devopsProjectCount} repositories add infrastructure depth, while external problem-solving signals raise confidence that the systems thinking is not GitHub-only.`
          : `${signals.devopsProjectCount} repositories add infrastructure depth to the overall profile.`,
      ],
      fitScores,
      sourceContributions: buildSourceContributions(fusion.categorySignals.systemDesign),
    }
  }

  if (developerType === DeveloperType.PROBLEM_SOLVER) {
    const topProblemSources = getTopContributingSources(fusion.problemSolvingStrength, 2)

    return {
      developerType,
      label: 'The Problem Solver',
      explanation:
        topProblemSources.length >= 2
          ? 'This profile is most shaped by deliberate multi-source problem-solving evidence rather than repository hints alone.'
          : 'This profile is most shaped by explicit problem-solving work and consistent technical practice signals.',
      dominantSignals: [
        summarizeProblemSolvingSources(fusion),
        fusion.interviewReadiness.explanation[0] ??
          `${humanizeCategory('algorithms')} is one of the strongest conservative category scores in the profile.`,
        signals.algorithmProjectCount > 0
          ? `${signals.algorithmProjectCount} repositories still provide useful public problem-solving context alongside practice-platform signals.`
          : `${humanizeCategory('algorithms')} is reinforced mostly by direct external practice rather than repository metadata alone.`,
      ],
      fitScores,
      sourceContributions: buildSourceContributions(fusion.problemSolvingStrength),
    }
  }

  return {
    developerType: DeveloperType.EXPLORER,
    label: 'The Explorer',
    explanation:
      'This profile stands out for technology breadth, experimentation, and expanding stack coverage over time.',
    dominantSignals: [
      `${signals.languageBreadth} distinct languages have appeared across synced repositories.`,
      `${signals.stackDiversity} core skill categories show meaningful repository evidence.`,
      fusion.sourceCoverage.connectedSources.length > 1
        ? `${fusion.sourceCoverage.connectedSources
            .map((source) => humanizeSource(source))
            .join(', ')} together widen the evidence base beyond a single platform and make experimentation signals more trustworthy.`
        : `${signals.recentLanguageAdoptions.length} recent language adoption signals suggest continued exploration.`,
    ],
    fitScores,
    sourceContributions: buildSourceContributions(fusion.explorationStrength),
  }
}
