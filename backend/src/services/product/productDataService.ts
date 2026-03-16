import { AccountProvider, CommitBucket, DeveloperType, LearningVelocity, Prisma, TimelineEventType } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import { AppError } from '../../utils/app-error'
import {
  getUserAggregatedLanguageDistribution,
  getUserDistinctLanguageCount,
  getUserRepositoryActivitySummaries,
  getUserTimelineAnalytics,
  getUserWeeklyCommitSeries,
} from '../analytics/sqlAnalyticsService'

export type ProductDataState = 'ready' | 'needs_sync' | 'needs_analysis' | 'partial_data'

export interface ProductUserState {
  userId: string
  displayName: string | null
  username: string | null
  targetRole: string | null
  hasConnectedGithub: boolean
  hasSyncedData: boolean
  hasAnalysis: boolean
  state: ProductDataState
  lastSyncAt: Date | null
  lastAnalysisAt: Date | null
  metadataOnlyAnalysis: boolean
  sourceCodeStorageDisabled: boolean
  repositoryCount: number
  languageCount: number
  connectedGithubUsername: string | null
}

export interface LatestGenomeProfileRecord {
  overallScore: number
  algorithmsScore: number
  backendScore: number
  frontendScore: number
  databaseScore: number
  devopsScore: number
  systemDesignScore: number
  securityScore: number
  collaborationScore: number
  developerType: DeveloperType
  learningVelocity: LearningVelocity
  summary: string | null
  generatedAt: Date
}

export interface LatestSkillGapReportRecord {
  targetRole: string
  matchScore: number
  summary: string | null
  missingSkills: string[]
  learningSuggestions: string[]
  recommendedProjects: string[]
  generatedAt: Date
}

export interface TimelineEventRecord {
  title: string
  description: string | null
  eventDate: Date
  eventType: TimelineEventType
  metadata: Prisma.JsonValue | null
}

export interface AggregatedLanguageDistributionRecord {
  language: string
  bytes: number
  percentage: number
}

export interface RepositorySummaryRecord {
  repositoryName: string
  fullName: string
  primaryLanguage: string | null
  lastUpdatedAt: Date | null
  lastPushedAt: Date | null
  starsCount: number
  commitCount: number
  activeWeeks: number
}

export interface WeeklyCommitSeriesRecord {
  bucketStart: Date
  bucketEnd: Date
  commitCount: number
  activeDays: number
}

export interface TimelineMetricRecord {
  period: string
  value: number
}

export interface TechnologyJourneyRecord {
  period: string
  technologies: string[]
}

export interface TimelineAnalyticsRecord {
  repositoryGrowth: TimelineMetricRecord[]
  activityGrowth: TimelineMetricRecord[]
  technologyBreadth: TimelineMetricRecord[]
  technologyJourney: TechnologyJourneyRecord[]
}

export interface ProductRepositoryContextRecord {
  repositoryName: string
  fullName: string
  description: string | null
  primaryLanguage: string | null
  lastUpdatedAt: Date | null
  lastPushedAt: Date | null
  topics: string[]
  starsCount: number
  forksCount: number
  languageStats: Array<{
    languageName: string
    bytesCount: number
    percentage: number
  }>
  commitSummaries: Array<{
    bucketStart: Date
    bucketEnd: Date
    commitCount: number
    activeDays: number
  }>
}

function resolveProductDataState(input: {
  hasConnectedGithub: boolean
  hasSyncedData: boolean
  hasAnalysis: boolean
  lastSyncAt: Date | null
  lastAnalysisAt: Date | null
}): ProductDataState {
  if (!input.hasConnectedGithub || !input.hasSyncedData || !input.lastSyncAt) {
    return 'needs_sync'
  }

  if (!input.hasAnalysis || !input.lastAnalysisAt) {
    return 'needs_analysis'
  }

  if (input.lastSyncAt.getTime() > input.lastAnalysisAt.getTime()) {
    return 'partial_data'
  }

  return 'ready'
}

function getLatestDate(dates: Array<Date | null | undefined>) {
  return dates
    .filter((date): date is Date => Boolean(date))
    .sort((left, right) => right.getTime() - left.getTime())[0] ?? null
}

export async function getProductUserState(userId: string): Promise<ProductUserState> {
  const [user, languageCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        username: true,
        preference: {
          select: {
            targetRole: true,
            metadataOnlyAnalysis: true,
            sourceCodeStorageDisabled: true,
          },
        },
        connectedAccounts: {
          where: {
            provider: AccountProvider.GITHUB,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: 1,
          select: {
            username: true,
            lastSyncedAt: true,
            disconnectedAt: true,
          },
        },
        _count: {
          select: {
            repositories: true,
          },
        },
        genomeProfiles: {
          orderBy: {
            generatedAt: 'desc',
          },
          take: 1,
          select: {
            generatedAt: true,
          },
        },
        skillGapReports: {
          orderBy: {
            generatedAt: 'desc',
          },
          take: 1,
          select: {
            generatedAt: true,
          },
        },
        timelineEvents: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            createdAt: true,
          },
        },
      },
    }),
    getUserDistinctLanguageCount(userId),
  ])

  if (!user) {
    throw new AppError(404, 'Authenticated user not found')
  }

  const latestGithubAccount = user.connectedAccounts[0] ?? null
  const hasConnectedGithub =
    latestGithubAccount !== null && latestGithubAccount.disconnectedAt === null
  const lastSyncAt = latestGithubAccount?.lastSyncedAt ?? null
  const lastAnalysisAt = getLatestDate([
    user.genomeProfiles[0]?.generatedAt,
    user.skillGapReports[0]?.generatedAt,
    user.timelineEvents[0]?.createdAt,
  ])
  const hasAnalysis =
    user.genomeProfiles.length > 0 ||
    user.skillGapReports.length > 0 ||
    user.timelineEvents.length > 0
  const hasSyncedData = user._count.repositories > 0

  return {
    userId: user.id,
    displayName: user.displayName,
    username: user.username,
    targetRole: user.preference?.targetRole ?? null,
    hasConnectedGithub,
    hasSyncedData,
    hasAnalysis,
    state: resolveProductDataState({
      hasConnectedGithub,
      hasSyncedData,
      hasAnalysis,
      lastSyncAt,
      lastAnalysisAt,
    }),
    lastSyncAt,
    lastAnalysisAt,
    metadataOnlyAnalysis: user.preference?.metadataOnlyAnalysis ?? true,
    sourceCodeStorageDisabled: user.preference?.sourceCodeStorageDisabled ?? true,
    repositoryCount: user._count.repositories,
    languageCount,
    connectedGithubUsername: latestGithubAccount?.username ?? null,
  }
}

export async function getLatestGenomeProfile(
  userId: string,
): Promise<LatestGenomeProfileRecord | null> {
  const genomeProfile = await prisma.genomeProfile.findFirst({
    where: { userId },
    orderBy: {
      generatedAt: 'desc',
    },
    select: {
      overallScore: true,
      algorithmsScore: true,
      backendScore: true,
      frontendScore: true,
      databaseScore: true,
      devopsScore: true,
      systemDesignScore: true,
      securityScore: true,
      collaborationScore: true,
      developerType: true,
      learningVelocity: true,
      summary: true,
      generatedAt: true,
    },
  })

  return genomeProfile
}

export async function getLatestSkillGapReports(
  userId: string,
): Promise<LatestSkillGapReportRecord[]> {
  const latestReport = await prisma.skillGapReport.findFirst({
    where: { userId },
    orderBy: {
      generatedAt: 'desc',
    },
    select: {
      generatedAt: true,
    },
  })

  if (!latestReport) {
    return []
  }

  return prisma.skillGapReport.findMany({
    where: {
      userId,
      generatedAt: latestReport.generatedAt,
    },
    orderBy: {
      targetRole: 'asc',
    },
    select: {
      targetRole: true,
      matchScore: true,
      summary: true,
      missingSkills: true,
      learningSuggestions: true,
      recommendedProjects: true,
      generatedAt: true,
    },
  })
}

export async function getTimelineEvents(
  userId: string,
): Promise<TimelineEventRecord[]> {
  return prisma.timelineEvent.findMany({
    where: { userId },
    orderBy: {
      eventDate: 'asc',
    },
    select: {
      title: true,
      description: true,
      eventDate: true,
      eventType: true,
      metadata: true,
    },
  })
}

export async function getAggregatedLanguageDistribution(
  userId: string,
): Promise<AggregatedLanguageDistributionRecord[]> {
  return getUserAggregatedLanguageDistribution(userId)
}

export async function getRepositorySummaries(
  userId: string,
): Promise<RepositorySummaryRecord[]> {
  return getUserRepositoryActivitySummaries(userId)
}

export async function getWeeklyCommitSeries(
  userId: string,
): Promise<WeeklyCommitSeriesRecord[]> {
  return getUserWeeklyCommitSeries(userId)
}

export async function getTimelineAnalytics(
  userId: string,
): Promise<TimelineAnalyticsRecord> {
  return getUserTimelineAnalytics(userId)
}

export async function getRepositoryActivityContext(
  userId: string,
): Promise<ProductRepositoryContextRecord[]> {
  const repositories = await prisma.repository.findMany({
    where: {
      userId,
      provider: AccountProvider.GITHUB,
    },
    orderBy: [
      {
        lastPushedAt: 'desc',
      },
      {
        providerUpdatedAt: 'desc',
      },
    ],
    select: {
      name: true,
      fullName: true,
      description: true,
      primaryLanguage: true,
      providerUpdatedAt: true,
      lastPushedAt: true,
      topics: true,
      starsCount: true,
      forksCount: true,
      languageStats: {
        orderBy: {
          bytesCount: 'desc',
        },
        select: {
          languageName: true,
          bytesCount: true,
          percentage: true,
        },
      },
      commitSummaries: {
        where: {
          bucketType: CommitBucket.WEEK,
        },
        orderBy: {
          bucketStart: 'asc',
        },
        select: {
          bucketStart: true,
          bucketEnd: true,
          commitCount: true,
          activeDays: true,
        },
      },
    },
  })

  return repositories.map((repository) => ({
    repositoryName: repository.name,
    fullName: repository.fullName,
    description: repository.description,
    primaryLanguage: repository.primaryLanguage,
    lastUpdatedAt: repository.providerUpdatedAt,
    lastPushedAt: repository.lastPushedAt,
    topics: repository.topics,
    starsCount: repository.starsCount,
    forksCount: repository.forksCount,
    languageStats: repository.languageStats,
    commitSummaries: repository.commitSummaries,
  }))
}
