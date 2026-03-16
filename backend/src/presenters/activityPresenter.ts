import type { DerivedAnalysisSignals } from '../services/analysis'
import type {
  AggregatedLanguageDistributionRecord,
  ProductUserState,
  RepositorySummaryRecord,
  WeeklyCommitSeriesRecord,
} from '../services/product/productDataService'
import type { ActivityResponse } from '../types/api/product'
import { presentProductMeta } from './productMetaPresenter'

function getConsistencyLabel(signals: DerivedAnalysisSignals | null) {
  if (!signals || signals.totalCommitCount === 0) {
    return 'Limited data'
  }

  if (signals.recentActiveWeeks >= 8 && signals.averageRecentActiveDays >= 2) {
    return 'Consistent'
  }

  if (signals.recentActiveWeeks >= 4) {
    return 'Building momentum'
  }

  return 'Burst-based'
}

function getActivityLevel(commitCount: number) {
  if (commitCount >= 40) {
    return 'high'
  }

  if (commitCount >= 14) {
    return 'medium'
  }

  return 'light'
}

function buildInsights(signals: DerivedAnalysisSignals | null) {
  if (!signals) {
    return []
  }

  const insights: ActivityResponse['insights'] = []

  if (signals.dominantLanguages[0]) {
    insights.push({
      title: 'Most active stack',
      description: `${signals.dominantLanguages[0]} is the strongest language signal across synced repositories.`,
      tone: 'positive',
    })
  }

  if (signals.recentActiveWeeks >= 8) {
    insights.push({
      title: 'Consistency trend',
      description: `Recent activity spans ${signals.recentActiveWeeks} active weeks, which points to a dependable shipping rhythm.`,
      tone: 'positive',
    })
  } else {
    insights.push({
      title: 'Consistency trend',
      description: 'Recent activity appears more bursty than steady, so consistency signals stay moderate.',
      tone: 'neutral',
    })
  }

  if (signals.recentLanguageAdoptions.length > 0) {
    insights.push({
      title: 'Experimentation pattern',
      description: `${signals.recentLanguageAdoptions.length} recent stack-adoption signals suggest active exploration.`,
      tone: 'positive',
    })
  }

  return insights.slice(0, 4)
}

export function presentActivity(input: {
  userState: ProductUserState
  weeklyCommitSeries: WeeklyCommitSeriesRecord[]
  languageDistribution: AggregatedLanguageDistributionRecord[]
  repositorySummaries: RepositorySummaryRecord[]
  signals: DerivedAnalysisSignals | null
}): ActivityResponse {
  const maxWeeklyCommitCount = Math.max(
    ...input.weeklyCommitSeries.map((summary) => summary.commitCount),
    0,
  )

  return {
    meta: presentProductMeta(input.userState),
    summary: {
      totalCommitCount: input.signals?.totalCommitCount ?? 0,
      activeRepositories: input.signals?.activeRepositoryCount ?? 0,
      consistencyLabel: getConsistencyLabel(input.signals),
      averageWeeklyCommits:
        input.weeklyCommitSeries.length === 0
          ? 0
          : Math.round(
              input.weeklyCommitSeries.reduce(
                (sum, summary) => sum + summary.commitCount,
                0,
              ) / input.weeklyCommitSeries.length,
            ),
      windowStart: input.weeklyCommitSeries[0]?.bucketStart.toISOString() ?? null,
      windowEnd: input.weeklyCommitSeries.at(-1)?.bucketEnd.toISOString() ?? null,
    },
    heatmap: {
      granularity: 'week',
      items: input.weeklyCommitSeries.map((summary) => ({
        bucketStart: summary.bucketStart.toISOString(),
        bucketEnd: summary.bucketEnd.toISOString(),
        commitCount: summary.commitCount,
        activeDays: summary.activeDays,
        intensity:
          maxWeeklyCommitCount === 0
            ? 0
            : Math.round((summary.commitCount / maxWeeklyCommitCount) * 100),
      })),
      emptyMessage:
        input.weeklyCommitSeries.length === 0
          ? 'Weekly activity data will appear after GitHub metadata sync and analysis.'
          : null,
    },
    languageUsage: {
      items: input.languageDistribution,
      emptyMessage:
        input.languageDistribution.length === 0
          ? 'Language analytics will populate once repository metadata is synced.'
          : null,
    },
    repositoryContribution: {
      items: [...input.repositorySummaries]
        .sort((left, right) => right.commitCount - left.commitCount)
        .slice(0, 6)
        .map((repository) => ({
          repositoryName: repository.repositoryName,
          fullName: repository.fullName,
          primaryLanguage: repository.primaryLanguage,
          commitCount: repository.commitCount,
          activeWeeks: repository.activeWeeks,
          lastUpdatedAt:
            repository.lastPushedAt?.toISOString() ??
            repository.lastUpdatedAt?.toISOString() ??
            null,
          activityLevel: getActivityLevel(repository.commitCount),
        })),
      emptyMessage:
        input.repositorySummaries.length === 0
          ? 'Repository-level activity will appear once commit summaries are available.'
          : null,
    },
    insights: buildInsights(input.signals),
    confidenceNote:
      input.weeklyCommitSeries.length > 0
        ? 'Activity analytics are based on stored weekly commit summaries rather than raw daily GitHub event history.'
        : null,
  }
}
