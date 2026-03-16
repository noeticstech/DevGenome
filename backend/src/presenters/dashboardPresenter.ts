import type { DerivedAnalysisSignals } from '../services/analysis'
import type {
  LatestGenomeProfileRecord,
  LatestSkillGapReportRecord,
  ProductUserState,
  RepositorySummaryRecord,
  AggregatedLanguageDistributionRecord,
} from '../services/product/productDataService'
import { getCoreSkillBreakdown } from '../services/product/productUtils'
import type { DashboardResponse } from '../types/api/product'
import {
  presentGenomeStatusLabel,
  presentLearningVelocityLabel,
  presentLearningVelocityValue,
  presentProductMeta,
} from './productMetaPresenter'

function buildRecentActivityInsight(repository: RepositorySummaryRecord) {
  if (repository.commitCount >= 24) {
    return 'High recent activity'
  }

  if (repository.primaryLanguage) {
    return `${repository.primaryLanguage} remains active`
  }

  return 'Recently updated project'
}

function buildHighlights(input: {
  genomeProfile: LatestGenomeProfileRecord | null
  preferredSkillGapReport: LatestSkillGapReportRecord | null
  signals: DerivedAnalysisSignals | null
}) {
  const highlights: string[] = []

  if (input.genomeProfile) {
    highlights.push(
      `Genome score is ${input.genomeProfile.overallScore}, with ${presentLearningVelocityLabel(input.genomeProfile.learningVelocity)?.toLowerCase() ?? 'steady'} learning velocity.`,
    )
  }

  if (input.signals && input.signals.recentLanguageAdoptions.length > 0) {
    highlights.push(
      `${input.signals.recentLanguageAdoptions.length} recent stack-adoption signals suggest continued exploration.`,
    )
  }

  if (
    input.preferredSkillGapReport &&
    input.preferredSkillGapReport.missingSkills.length > 0
  ) {
    highlights.push(
      `Biggest gap toward ${input.preferredSkillGapReport.targetRole}: ${input.preferredSkillGapReport.missingSkills.slice(0, 2).join(', ')}.`,
    )
  }

  return highlights
}

export function presentDashboard(input: {
  userState: ProductUserState
  genomeProfile: LatestGenomeProfileRecord | null
  preferredSkillGapReport: LatestSkillGapReportRecord | null
  languageDistribution: AggregatedLanguageDistributionRecord[]
  recentRepositories: RepositorySummaryRecord[]
  signals: DerivedAnalysisSignals | null
}): DashboardResponse {
  const recentActivityItems = input.recentRepositories
    .slice(0, 5)
    .map((repository) => ({
      repositoryName: repository.repositoryName,
      fullName: repository.fullName,
      primaryLanguage: repository.primaryLanguage,
      activityCount: repository.commitCount,
      lastUpdatedAt:
        repository.lastPushedAt?.toISOString() ??
        repository.lastUpdatedAt?.toISOString() ??
        null,
      insight: buildRecentActivityInsight(repository),
    }))

  return {
    meta: presentProductMeta(input.userState),
    overview: {
      genomeScore: {
        value: input.genomeProfile?.overallScore ?? null,
        statusLabel: presentGenomeStatusLabel(input.genomeProfile?.overallScore ?? null),
        generatedAt: input.genomeProfile?.generatedAt.toISOString() ?? null,
      },
      repositories: {
        value: input.userState.repositoryCount,
        label: 'Repositories synced',
      },
      languages: {
        value: input.userState.languageCount,
        label: 'Languages detected',
      },
      learningVelocity: {
        label: presentLearningVelocityLabel(input.genomeProfile?.learningVelocity ?? null),
        value: presentLearningVelocityValue(input.genomeProfile?.learningVelocity ?? null),
      },
    },
    skillRadar: {
      items: getCoreSkillBreakdown(input.genomeProfile),
      emptyMessage:
        input.genomeProfile === null
          ? 'Run analysis to populate the DevGenome skill radar.'
          : null,
    },
    languageDistribution: {
      items: input.languageDistribution,
      emptyMessage:
        input.languageDistribution.length === 0
          ? 'Sync repository metadata to populate language distribution.'
          : null,
    },
    recentActivity: {
      windowStart: input.signals?.weeklyActivity[0]?.bucketStart.toISOString() ?? null,
      windowEnd: input.signals?.weeklyActivity.at(-1)?.bucketEnd.toISOString() ?? null,
      items: recentActivityItems,
      emptyMessage:
        recentActivityItems.length === 0
          ? 'Recent activity will appear here after repository metadata is synced.'
          : null,
    },
    skillGapTeaser: {
      targetRole: input.preferredSkillGapReport?.targetRole ?? input.userState.targetRole,
      readinessScore: input.preferredSkillGapReport?.matchScore ?? null,
      topMissingSkills: input.preferredSkillGapReport?.missingSkills.slice(0, 3) ?? [],
      actionHint:
        input.preferredSkillGapReport?.learningSuggestions[0] ??
        (input.userState.state === 'needs_analysis'
          ? 'Run analysis to unlock role-fit guidance.'
          : null),
    },
    highlights: buildHighlights({
      genomeProfile: input.genomeProfile,
      preferredSkillGapReport: input.preferredSkillGapReport,
      signals: input.signals,
    }),
  }
}
