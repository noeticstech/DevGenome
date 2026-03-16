import { prisma } from '../../lib/prisma'
import {
  buildActivityGrowthMetricsQuery,
  buildAggregatedLanguageDistributionQuery,
  buildDistinctLanguageCountQuery,
  buildRepositoryActivitySummariesQuery,
  buildRepositoryGrowthMetricsQuery,
  buildTechnologyBreadthMetricsQuery,
  buildTechnologyJourneyQuery,
  buildWeeklyCommitSeriesQuery,
} from './sqlQueries'
import type {
  SqlLanguageCountRecord,
  SqlLanguageDistributionRecord,
  SqlPeriodMetricRecord,
  SqlRepositoryActivitySummaryRecord,
  SqlTechnologyJourneyRecord,
  SqlTimelineAnalyticsRecord,
  SqlWeeklyCommitSeriesRecord,
} from './sqlTypes'

type NumericLike = number | bigint | null

function toNumber(value: NumericLike) {
  if (typeof value === 'bigint') {
    return Number(value)
  }

  return value ?? 0
}

function normalizePeriodMetrics(
  rows: Array<{ period: string | null; value: NumericLike }>,
): SqlPeriodMetricRecord[] {
  return rows
    .filter((row): row is { period: string; value: NumericLike } => Boolean(row.period))
    .map((row) => ({
      period: row.period,
      value: toNumber(row.value),
    }))
}

export async function getUserDistinctLanguageCount(userId: string): Promise<number> {
  const [row] = await prisma.$queryRaw<Array<{ languageCount: NumericLike }>>(
    buildDistinctLanguageCountQuery(userId),
  )

  return toNumber(row?.languageCount ?? 0)
}

export async function getUserAggregatedLanguageDistribution(
  userId: string,
): Promise<SqlLanguageDistributionRecord[]> {
  const rows = await prisma.$queryRaw<
    Array<{ language: string; bytes: NumericLike; percentage: number | null }>
  >(buildAggregatedLanguageDistributionQuery(userId))

  return rows.map((row) => ({
    language: row.language,
    bytes: toNumber(row.bytes),
    percentage: row.percentage ?? 0,
  }))
}

export async function getUserWeeklyCommitSeries(
  userId: string,
): Promise<SqlWeeklyCommitSeriesRecord[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      bucketStart: Date
      bucketEnd: Date
      commitCount: NumericLike
      activeDays: NumericLike
    }>
  >(buildWeeklyCommitSeriesQuery(userId))

  return rows.map((row) => ({
    bucketStart: row.bucketStart,
    bucketEnd: row.bucketEnd,
    commitCount: toNumber(row.commitCount),
    activeDays: Math.min(toNumber(row.activeDays), 7),
  }))
}

export async function getUserRepositoryActivitySummaries(
  userId: string,
): Promise<SqlRepositoryActivitySummaryRecord[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      repositoryName: string
      fullName: string
      primaryLanguage: string | null
      lastUpdatedAt: Date | null
      lastPushedAt: Date | null
      starsCount: NumericLike
      commitCount: NumericLike
      activeWeeks: NumericLike
    }>
  >(buildRepositoryActivitySummariesQuery(userId))

  return rows.map((row) => ({
    repositoryName: row.repositoryName,
    fullName: row.fullName,
    primaryLanguage: row.primaryLanguage,
    lastUpdatedAt: row.lastUpdatedAt,
    lastPushedAt: row.lastPushedAt,
    starsCount: toNumber(row.starsCount),
    commitCount: toNumber(row.commitCount),
    activeWeeks: toNumber(row.activeWeeks),
  }))
}

export async function getUserTimelineAnalytics(
  userId: string,
): Promise<SqlTimelineAnalyticsRecord> {
  const [repositoryGrowthRows, activityGrowthRows, technologyBreadthRows, technologyJourneyRows] =
    await Promise.all([
      prisma.$queryRaw<Array<{ period: string | null; value: NumericLike }>>(
        buildRepositoryGrowthMetricsQuery(userId),
      ),
      prisma.$queryRaw<Array<{ period: string | null; value: NumericLike }>>(
        buildActivityGrowthMetricsQuery(userId),
      ),
      prisma.$queryRaw<Array<{ period: string | null; value: NumericLike }>>(
        buildTechnologyBreadthMetricsQuery(userId),
      ),
      prisma.$queryRaw<
        Array<{ period: string | null; technologies: string[] | null }>
      >(buildTechnologyJourneyQuery(userId)),
    ])

  return {
    repositoryGrowth: normalizePeriodMetrics(repositoryGrowthRows),
    activityGrowth: normalizePeriodMetrics(activityGrowthRows),
    technologyBreadth: normalizePeriodMetrics(technologyBreadthRows),
    technologyJourney: technologyJourneyRows
      .filter(
        (row): row is { period: string; technologies: string[] | null } =>
          Boolean(row.period),
      )
      .map((row) => ({
        period: row.period,
        technologies: row.technologies ?? [],
      })),
  }
}

export type {
  SqlLanguageCountRecord,
  SqlLanguageDistributionRecord,
  SqlPeriodMetricRecord,
  SqlRepositoryActivitySummaryRecord,
  SqlTechnologyJourneyRecord,
  SqlTimelineAnalyticsRecord,
  SqlWeeklyCommitSeriesRecord,
}
