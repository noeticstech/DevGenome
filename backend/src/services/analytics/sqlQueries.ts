import { Prisma } from '@prisma/client'

export function buildDistinctLanguageCountQuery(userId: string) {
  return Prisma.sql`
    SELECT COUNT(DISTINCT "languageName")::int AS "languageCount"
    FROM "LanguageStat"
    WHERE "userId" = ${userId}
  `
}

export function buildAggregatedLanguageDistributionQuery(userId: string) {
  return Prisma.sql`
    WITH language_totals AS (
      SELECT
        "languageName" AS "language",
        COALESCE(SUM("bytesCount"), 0)::bigint AS "bytes"
      FROM "LanguageStat"
      WHERE "userId" = ${userId}
      GROUP BY "languageName"
    )
    SELECT
      "language",
      "bytes",
      CASE
        WHEN SUM("bytes") OVER () = 0 THEN 0
        ELSE ROUND((("bytes"::numeric / SUM("bytes") OVER ()) * 100), 2)::double precision
      END AS "percentage"
    FROM language_totals
    ORDER BY "bytes" DESC, "language" ASC
  `
}

export function buildWeeklyCommitSeriesQuery(userId: string) {
  return Prisma.sql`
    SELECT
      "bucketStart",
      MAX("bucketEnd") AS "bucketEnd",
      COALESCE(SUM("commitCount"), 0)::int AS "commitCount",
      LEAST(COALESCE(SUM("activeDays"), 0), 7)::int AS "activeDays"
    FROM "CommitSummary"
    WHERE
      "userId" = ${userId}
      AND "bucketType" = 'WEEK'
    GROUP BY "bucketStart"
    ORDER BY "bucketStart" ASC
  `
}

export function buildRepositoryActivitySummariesQuery(userId: string) {
  return Prisma.sql`
    SELECT
      r."name" AS "repositoryName",
      r."fullName" AS "fullName",
      r."primaryLanguage" AS "primaryLanguage",
      r."providerUpdatedAt" AS "lastUpdatedAt",
      r."lastPushedAt" AS "lastPushedAt",
      r."starsCount"::int AS "starsCount",
      COALESCE(SUM(cs."commitCount"), 0)::int AS "commitCount",
      COALESCE(COUNT(*) FILTER (WHERE cs."commitCount" > 0), 0)::int AS "activeWeeks"
    FROM "Repository" r
    LEFT JOIN "CommitSummary" cs
      ON cs."repositoryId" = r."id"
      AND cs."bucketType" = 'WEEK'
    WHERE
      r."userId" = ${userId}
      AND r."provider" = 'GITHUB'
    GROUP BY
      r."id",
      r."name",
      r."fullName",
      r."primaryLanguage",
      r."providerUpdatedAt",
      r."lastPushedAt",
      r."starsCount"
    ORDER BY
      r."lastPushedAt" DESC NULLS LAST,
      r."providerUpdatedAt" DESC NULLS LAST
  `
}

export function buildRepositoryGrowthMetricsQuery(userId: string) {
  return Prisma.sql`
    WITH repository_years AS (
      SELECT DATE_TRUNC(
        'year',
        COALESCE("providerCreatedAt", "providerUpdatedAt", "lastPushedAt")
      ) AS "yearStart"
      FROM "Repository"
      WHERE
        "userId" = ${userId}
        AND "provider" = 'GITHUB'
        AND COALESCE("providerCreatedAt", "providerUpdatedAt", "lastPushedAt") IS NOT NULL
    ),
    year_counts AS (
      SELECT
        "yearStart",
        COUNT(*)::int AS "count"
      FROM repository_years
      GROUP BY "yearStart"
    )
    SELECT
      TO_CHAR("yearStart", 'YYYY') AS "period",
      SUM("count") OVER (ORDER BY "yearStart")::int AS "value"
    FROM year_counts
    ORDER BY "yearStart" ASC
  `
}

export function buildActivityGrowthMetricsQuery(userId: string) {
  return Prisma.sql`
    SELECT
      TO_CHAR(DATE_TRUNC('year', "bucketStart"), 'YYYY') AS "period",
      COALESCE(SUM("commitCount"), 0)::int AS "value"
    FROM "CommitSummary"
    WHERE
      "userId" = ${userId}
      AND "bucketType" = 'WEEK'
    GROUP BY DATE_TRUNC('year', "bucketStart")
    ORDER BY DATE_TRUNC('year', "bucketStart") ASC
  `
}

export function buildTechnologyBreadthMetricsQuery(userId: string) {
  return Prisma.sql`
    WITH first_seen AS (
      SELECT
        ls."languageName" AS "languageName",
        DATE_TRUNC(
          'year',
          MIN(COALESCE(r."providerCreatedAt", r."providerUpdatedAt", r."lastPushedAt"))
        ) AS "yearStart"
      FROM "LanguageStat" ls
      JOIN "Repository" r
        ON r."id" = ls."repositoryId"
      WHERE
        ls."userId" = ${userId}
        AND r."provider" = 'GITHUB'
        AND COALESCE(r."providerCreatedAt", r."providerUpdatedAt", r."lastPushedAt") IS NOT NULL
      GROUP BY ls."languageName"
    ),
    year_counts AS (
      SELECT
        "yearStart",
        COUNT(*)::int AS "count"
      FROM first_seen
      GROUP BY "yearStart"
    )
    SELECT
      TO_CHAR("yearStart", 'YYYY') AS "period",
      SUM("count") OVER (ORDER BY "yearStart")::int AS "value"
    FROM year_counts
    ORDER BY "yearStart" ASC
  `
}

export function buildTechnologyJourneyQuery(userId: string) {
  return Prisma.sql`
    WITH first_seen AS (
      SELECT
        ls."languageName" AS "languageName",
        DATE_TRUNC(
          'year',
          MIN(COALESCE(r."providerCreatedAt", r."providerUpdatedAt", r."lastPushedAt"))
        ) AS "yearStart"
      FROM "LanguageStat" ls
      JOIN "Repository" r
        ON r."id" = ls."repositoryId"
      WHERE
        ls."userId" = ${userId}
        AND r."provider" = 'GITHUB'
        AND COALESCE(r."providerCreatedAt", r."providerUpdatedAt", r."lastPushedAt") IS NOT NULL
      GROUP BY ls."languageName"
    )
    SELECT
      TO_CHAR("yearStart", 'YYYY') AS "period",
      ARRAY_AGG("languageName" ORDER BY "languageName" ASC) AS "technologies"
    FROM first_seen
    GROUP BY "yearStart"
    ORDER BY "yearStart" ASC
  `
}
