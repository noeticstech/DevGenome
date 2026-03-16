import type { DerivedAnalysisSignals } from '../services/analysis'
import type { FusedAnalysisSignals } from '../services/analysis/fusion'
import type {
  LatestGenomeProfileRecord,
  LatestSkillGapReportRecord,
  ProductUserState,
} from '../services/product/productDataService'
import {
  getCoreSkillBreakdown,
  getSecondarySkillGapReport,
  getStrongestAndWeakestCategories,
  selectPreferredSkillGapReport,
} from '../services/product/productUtils'
import type { GenomeResponse } from '../types/api/product'
import {
  presentDeveloperTypeExplanation,
  presentDeveloperTypeLabel,
  presentGenomeStatusLabel,
  presentProductMeta,
} from './productMetaPresenter'

function buildDominantSignals(input: {
  genomeProfile: LatestGenomeProfileRecord | null
  signals: DerivedAnalysisSignals | null
  fusion: FusedAnalysisSignals | null
}) {
  if (!input.genomeProfile || !input.signals) {
    return []
  }

  switch (input.genomeProfile.developerType) {
    case 'BUILDER':
      return [
        `${input.signals.totalRepositories} synced repositories show clear project-building evidence.`,
        `${input.signals.activeRepositoryCount} repositories have recent activity or updates.`,
        `${input.signals.multiCategoryRepositoryCount} repositories span more than one technical layer.`,
      ]
    case 'ARCHITECT':
      return [
        `${input.signals.backendProjectCount} repositories show backend system signals.`,
        `${input.signals.devopsProjectCount} repositories add infrastructure depth.`,
        `${input.signals.systemDesignProjectCount} repositories show architecture-oriented metadata.`,
      ]
    case 'PROBLEM_SOLVER':
      return [
        input.fusion?.problemSolvingStrength.explanation[0] ??
          `${input.signals.algorithmProjectCount} repositories show explicit problem-solving or algorithms signals.`,
        input.fusion?.interviewReadiness.explanation[0] ??
          `${input.signals.totalActiveWeeks} active weeks create a solid consistency base.`,
        input.fusion?.sourceCoverage.problemSolvingSources.length
          ? `${input.fusion.sourceCoverage.problemSolvingSources
              .map((source) =>
                source === 'github'
                  ? 'GitHub'
                  : source === 'leetcode'
                    ? 'LeetCode'
                    : 'Codeforces',
              )
              .join(', ')} shape the strongest current problem-solving signal mix.`
          : `${input.signals.languageBreadth} detected languages suggest versatile technical practice.`,
      ]
    case 'EXPLORER':
      return [
        `${input.signals.languageBreadth} detected languages show broad stack exposure.`,
        `${input.signals.stackDiversity} core skill categories have repository evidence.`,
        `${input.signals.recentLanguageAdoptions.length} recent stack-adoption signals show ongoing experimentation.`,
      ]
    default:
      return []
  }
}

export function presentGenome(input: {
  userState: ProductUserState
  genomeProfile: LatestGenomeProfileRecord | null
  skillGapReports: LatestSkillGapReportRecord[]
  signals: DerivedAnalysisSignals | null
  fusion: FusedAnalysisSignals | null
}): GenomeResponse {
  const skillBreakdown = getCoreSkillBreakdown(input.genomeProfile)
  const strongestAndWeakest = getStrongestAndWeakestCategories(input.genomeProfile)
  const preferredFit = selectPreferredSkillGapReport({
    reports: input.skillGapReports,
    targetRole: input.userState.targetRole,
  })
  const secondaryFit = getSecondarySkillGapReport({
    reports: input.skillGapReports,
    preferredTargetRole: preferredFit?.targetRole ?? null,
  })

  return {
    meta: presentProductMeta(input.userState),
    summary: {
      genomeScore: input.genomeProfile?.overallScore ?? null,
      statusLabel: presentGenomeStatusLabel(input.genomeProfile?.overallScore ?? null),
      subtitle: input.genomeProfile?.summary ?? null,
      generatedAt: input.genomeProfile?.generatedAt.toISOString() ?? null,
    },
    skillBreakdown: {
      items: skillBreakdown,
      strongest: strongestAndWeakest.strongest,
      weakest: strongestAndWeakest.weakest,
    },
    visualization: {
      radial: skillBreakdown,
      strands: [
        {
          group: 'Execution',
          items: skillBreakdown.filter((item) =>
            ['frontend', 'backend', 'databases'].includes(item.key),
          ),
        },
        {
          group: 'Scale',
          items: skillBreakdown.filter((item) =>
            ['devops', 'systemDesign'].includes(item.key),
          ),
        },
        {
          group: 'Reasoning',
          items: skillBreakdown.filter((item) => item.key === 'algorithms'),
        },
      ],
      strengths: strongestAndWeakest.strongest,
      growthAreas: strongestAndWeakest.weakest,
    },
    archetype: {
      code: input.genomeProfile?.developerType ?? null,
      label: presentDeveloperTypeLabel(input.genomeProfile?.developerType ?? null),
      explanation: presentDeveloperTypeExplanation(input.genomeProfile?.developerType ?? null),
      dominantSignals: buildDominantSignals({
        genomeProfile: input.genomeProfile,
        signals: input.signals,
        fusion: input.fusion,
      }),
    },
    careerFit: {
      primary: preferredFit
        ? {
            targetRole: preferredFit.targetRole,
            readinessScore: preferredFit.matchScore,
            summary: preferredFit.summary ?? '',
          }
        : null,
      secondary: secondaryFit
        ? {
            targetRole: secondaryFit.targetRole,
            readinessScore: secondaryFit.matchScore,
          }
        : null,
      growthFocus: preferredFit?.missingSkills.slice(0, 3) ?? strongestAndWeakest.weakest,
    },
    supportingMeta: {
      strongestCategories: strongestAndWeakest.strongest,
      weakestCategories: strongestAndWeakest.weakest,
      generatedAt: input.genomeProfile?.generatedAt.toISOString() ?? null,
    },
  }
}
