import { env } from '../../config/env'
import {
  buildAnalysisSnapshotCacheSalt,
  getCachedAnalysisSnapshotForUser,
  type DerivedAnalysisSignals,
} from '../analysis'
import {
  buildCacheTimestamp,
  createUserScopedCacheKey,
  getOrSetRuntimeCacheValue,
} from '../cache'
import {
  getAggregatedLanguageDistribution,
  getLatestGenomeProfile,
  getLatestSkillGapReports,
  getProductUserState,
  getTimelineEvents,
} from '../product/productDataService'
import {
  getCoreSkillBreakdown,
  getSecondarySkillGapReport,
  getStrongestAndWeakestCategories,
  selectPreferredSkillGapReport,
} from '../product/productUtils'
import {
  presentDeveloperTypeLabel,
  presentGenomeStatusLabel,
  presentLearningVelocityLabel,
} from '../../presenters/productMetaPresenter'
import type {
  GeminiInsightInput,
  GeminiInsightSourceData,
} from './geminiTypes'

function buildAvailability(input: {
  hasSyncedData: boolean
  hasAnalysis: boolean
}) {
  if (!input.hasSyncedData) {
    return 'needs_sync' as const
  }

  if (!input.hasAnalysis) {
    return 'needs_analysis' as const
  }

  return 'ready' as const
}

function buildLimitations(input: {
  state: string
  hasConnectedGithub: boolean
  hasSyncedData: boolean
  signals: DerivedAnalysisSignals | null
}) {
  const limitations: string[] = []

  if (!input.hasConnectedGithub) {
    limitations.push(
      'GitHub is not currently connected, so project and activity evidence only reflects previously stored metadata.',
    )
  }

  if (!input.hasSyncedData) {
    limitations.push(
      'Repository sync data is limited or missing, so project-depth explanations must stay conservative.',
    )
  }

  if (input.state === 'partial_data') {
    limitations.push(
      'The latest sync is newer than the latest analysis run, so explanations may lag behind the freshest repository metadata.',
    )
  }

  if (input.signals?.totalCommitCount === 0) {
    limitations.push(
      'Commit activity evidence is limited, so consistency and growth explanations should be treated as conservative.',
    )
  }

  if ((input.signals?.languageBreadth ?? 0) <= 1) {
    limitations.push(
      'Language breadth is currently narrow, so stack-diversity and exploration conclusions are intentionally modest.',
    )
  }

  if (
    input.signals &&
    !input.signals.leetcodeProfilePresent &&
    !input.signals.codeforcesProfilePresent
  ) {
    limitations.push(
      'Competitive problem-solving evidence is limited to the currently synced metadata and may understate algorithmic depth.',
    )
  }

  return limitations
}

function buildEmptyMessage(availability: GeminiInsightSourceData['availability']) {
  if (availability === 'needs_sync') {
    return 'Sync repository metadata and run analysis before generating AI explanations.'
  }

  if (availability === 'needs_analysis') {
    return 'Deterministic analysis needs to run before Gemini can generate grounded explanations.'
  }

  return null
}

export async function buildGeminiInsightSourceData(
  userId: string,
): Promise<GeminiInsightSourceData> {
  const userState = await getProductUserState(userId)
  const cacheKey = createUserScopedCacheKey({
    scope: 'ai_insight_source',
    userId,
    parts: [
      userState.state,
      buildCacheTimestamp(userState.lastSyncAt),
      buildCacheTimestamp(userState.lastAnalysisAt),
      userState.targetRole ?? 'none',
      userState.repositoryCount,
      userState.languageCount,
    ],
  })

  return getOrSetRuntimeCacheValue({
    key: cacheKey,
    userId,
    ttlMs: env.AI_RESPONSE_CACHE_TTL_MS,
    loader: async () => {
      const availability = buildAvailability({
        hasSyncedData: userState.hasSyncedData,
        hasAnalysis: userState.hasAnalysis,
      })

      const [genomeProfile, skillGapReports, timelineEvents, languageDistribution] =
        await Promise.all([
          getLatestGenomeProfile(userId),
          getLatestSkillGapReports(userId),
          getTimelineEvents(userId),
          getAggregatedLanguageDistribution(userId),
        ])

      const basedOnAnalysisAt =
        genomeProfile?.generatedAt ??
        skillGapReports[0]?.generatedAt ??
        timelineEvents.at(-1)?.eventDate ??
        null

      if (availability !== 'ready' || !genomeProfile) {
        const fallbackAvailability =
          availability === 'ready' && !genomeProfile ? 'needs_analysis' : availability

        return {
          availability: fallbackAvailability,
          state: userState.state,
          basedOnAnalysisAt,
          basedOnSyncAt: userState.lastSyncAt,
          warnings: buildLimitations({
            state: userState.state,
            hasConnectedGithub: userState.hasConnectedGithub,
            hasSyncedData: userState.hasSyncedData,
            signals: null,
          }),
          emptyMessage: buildEmptyMessage(fallbackAvailability),
          input: null,
        }
      }

      const signals = userState.hasSyncedData
        ? (
            await getCachedAnalysisSnapshotForUser({
              userId,
              cacheSalt: buildAnalysisSnapshotCacheSalt({
                state: userState.state,
                lastSyncAt: userState.lastSyncAt,
                repositoryCount: userState.repositoryCount,
                languageCount: userState.languageCount,
              }),
            })
          ).signals
        : null

      const preferredSkillGapReport = selectPreferredSkillGapReport({
        reports: skillGapReports,
        targetRole: userState.targetRole,
      })
      const secondarySkillGapReport = getSecondarySkillGapReport({
        reports: skillGapReports,
        preferredTargetRole: preferredSkillGapReport?.targetRole ?? null,
      })
      const strongestAndWeakest = getStrongestAndWeakestCategories(genomeProfile)
      const limitations = buildLimitations({
        state: userState.state,
        hasConnectedGithub: userState.hasConnectedGithub,
        hasSyncedData: userState.hasSyncedData,
        signals,
      })

      const input: GeminiInsightInput = {
        user: {
          displayName: userState.displayName,
          username: userState.username,
          targetRole:
            preferredSkillGapReport?.targetRole ??
            userState.targetRole ??
            secondarySkillGapReport?.targetRole ??
            'Software Engineer',
        },
        productState: {
          state: userState.state,
          hasConnectedGithub: userState.hasConnectedGithub,
          hasSyncedData: userState.hasSyncedData,
          hasAnalysis: userState.hasAnalysis,
          metadataOnlyAnalysis: userState.metadataOnlyAnalysis,
          sourceCodeStorage: 'disabled',
          lastSyncAt: userState.lastSyncAt?.toISOString() ?? null,
          lastAnalysisAt: userState.lastAnalysisAt?.toISOString() ?? null,
        },
        genome: {
          overallScore: genomeProfile.overallScore,
          statusLabel: presentGenomeStatusLabel(genomeProfile.overallScore) ?? 'Unrated',
          developerTypeCode: genomeProfile.developerType,
          developerTypeLabel:
            presentDeveloperTypeLabel(genomeProfile.developerType) ??
            genomeProfile.developerType,
          learningVelocity:
            presentLearningVelocityLabel(genomeProfile.learningVelocity) ??
            genomeProfile.learningVelocity,
          summary: genomeProfile.summary,
          strongestCategories: strongestAndWeakest.strongest,
          weakestCategories: strongestAndWeakest.weakest,
          skillScores: getCoreSkillBreakdown(genomeProfile).map((item) => ({
            key: item.key,
            label: item.label,
            score: item.value,
          })),
          generatedAt: genomeProfile.generatedAt.toISOString(),
        },
        roleFit: {
          preferredRole:
            preferredSkillGapReport?.targetRole ??
            userState.targetRole ??
            'Software Engineer',
          readinessScore: preferredSkillGapReport?.matchScore ?? 0,
          summary: preferredSkillGapReport?.summary ?? null,
          strongestAreas:
            strongestAndWeakest.strongest.length > 0
              ? strongestAndWeakest.strongest
              : ['Profile signals are still emerging'],
          missingSkills: preferredSkillGapReport?.missingSkills ?? [],
          learningSuggestions: preferredSkillGapReport?.learningSuggestions ?? [],
          recommendedProjects: preferredSkillGapReport?.recommendedProjects ?? [],
          alternativeFits: [secondarySkillGapReport]
            .filter(
              (
                report,
              ): report is NonNullable<typeof secondarySkillGapReport> =>
                Boolean(report),
            )
            .map((report) => ({
              targetRole: report.targetRole,
              readinessScore: report.matchScore,
            })),
        },
        activity: {
          repositoryCount: signals?.totalRepositories ?? userState.repositoryCount,
          activeRepositoryCount: signals?.activeRepositoryCount ?? 0,
          languageBreadth: signals?.languageBreadth ?? userState.languageCount,
          dominantLanguages: signals?.dominantLanguages ?? [],
          totalCommitCount: signals?.totalCommitCount ?? 0,
          recentCommitCount: signals?.recentCommitCount ?? 0,
          totalActiveWeeks: signals?.totalActiveWeeks ?? 0,
          recentActiveWeeks: signals?.recentActiveWeeks ?? 0,
          stackDiversity: signals?.stackDiversity ?? 0,
          experimentationIndex: signals?.experimentationIndex ?? 0,
          latestRepositoryAt: signals?.latestRepositoryAt?.toISOString() ?? null,
          latestActivityAt: signals?.latestActivityAt?.toISOString() ?? null,
          recentLanguageAdoptions:
            signals?.recentLanguageAdoptions
              .slice(0, 5)
              .map((adoption) => adoption.languageName) ?? [],
          topLanguages: languageDistribution.slice(0, 5).map((language) => ({
            language: language.language,
            percentage: language.percentage,
          })),
        },
        competitiveSignals: {
          leetcode: signals?.leetcodeProfilePresent
            ? {
                totalSolved: signals.leetcodeTotalSolved,
                difficultyBreakdown: {
                  easy: signals.leetcodeEasySolved,
                  medium: signals.leetcodeMediumSolved,
                  hard: signals.leetcodeHardSolved,
                },
                currentStreak: signals.leetcodeCurrentStreak,
                topicBreadth: signals.leetcodeTopicBreadth,
                contestParticipationCount: signals.leetcodeContestParticipationCount,
                contestRating: signals.leetcodeContestRating,
              }
            : null,
          codeforces: signals?.codeforcesProfilePresent
            ? {
                currentRating: signals.codeforcesCurrentRating,
                maxRating: signals.codeforcesMaxRating,
                contestCount: signals.codeforcesContestCount,
                recentContestCount: signals.codeforcesRecentContestCount,
                totalSolvedProblems: signals.codeforcesTotalSolvedProblems,
                tagBreadth: signals.codeforcesTagBreadth,
                averageSolvedProblemRating:
                  signals.codeforcesAverageSolvedProblemRating,
                maxSolvedProblemRating: signals.codeforcesMaxSolvedProblemRating,
              }
            : null,
        },
        timeline: {
          milestoneCount: timelineEvents.length,
          stackExpansionCount: signals?.languageAdoptions.length ?? 0,
          highlights: timelineEvents.slice(-5).map((event) => ({
            title: event.title,
            description: event.description,
            eventDate: event.eventDate.toISOString(),
            eventType: event.eventType,
          })),
        },
        limitations,
      }

      return {
        availability: 'ready',
        state: userState.state,
        basedOnAnalysisAt,
        basedOnSyncAt: userState.lastSyncAt,
        warnings: limitations,
        emptyMessage: null,
        input,
      }
    },
  })
}
