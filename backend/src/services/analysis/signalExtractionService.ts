import type { AnalysisContext, CategoryMilestoneSignal, DerivedAnalysisSignals, LanguageAdoptionSignal, RepositorySignal, WeeklyActivitySignal } from './analysisTypes'
import {
  buildRepositoryText,
  getAlgorithmsKeywordMatches,
  getBackendKeywordMatches,
  getDatabaseKeywordMatches,
  getDevopsKeywordMatches,
  getFrontendKeywordMatches,
  getSecurityKeywordMatches,
  getSystemDesignKeywordMatches,
  getTestingKeywordMatches,
  isBackendLanguageSignal,
  isDatabaseLanguageSignal,
  isDevopsLanguageSignal,
  isFrontendLanguageSignal,
  isWithinDays,
  normalizeTerm,
  topLabelsByValue,
  uniqueStrings,
} from './analysisUtils'

const RECENT_REPOSITORY_WINDOW_DAYS = 180
const RECENT_ACTIVITY_WINDOW_DAYS = 84
const PRIOR_ACTIVITY_WINDOW_DAYS = 168

function pickRepositoryReferenceDate(repository: AnalysisContext['repositories'][number]) {
  return (
    repository.providerCreatedAt ??
    repository.providerUpdatedAt ??
    repository.lastPushedAt ??
    null
  )
}

function getRepositoryLanguages(repository: AnalysisContext['repositories'][number]) {
  return uniqueStrings(
    [
      repository.primaryLanguage,
      ...repository.languageStats.map((language) => language.languageName),
    ]
      .filter((value): value is string => Boolean(value))
      .map(normalizeTerm),
  )
}

function addMatchedKeywords(
  target: Partial<Record<'frontend' | 'backend' | 'databases' | 'devops' | 'systemDesign' | 'algorithms' | 'security' | 'testing', string[]>>,
  key: keyof typeof target,
  values: string[],
) {
  if (values.length === 0) {
    return
  }

  target[key] = uniqueStrings([...(target[key] ?? []), ...values])
}

function evaluateRepositorySignal(
  repository: AnalysisContext['repositories'][number],
  referenceDate: Date,
): RepositorySignal {
  const languages = getRepositoryLanguages(repository)
  const repositoryText = buildRepositoryText([
    repository.name,
    repository.fullName,
    repository.description,
    ...repository.topics,
    ...languages,
  ])

  const frontendMatches = getFrontendKeywordMatches(repositoryText)
  const backendMatches = getBackendKeywordMatches(repositoryText)
  const databaseMatches = getDatabaseKeywordMatches(repositoryText)
  const devopsMatches = getDevopsKeywordMatches(repositoryText)
  const systemDesignMatches = getSystemDesignKeywordMatches(repositoryText)
  const algorithmsMatches = getAlgorithmsKeywordMatches(repositoryText)
  const securityMatches = getSecurityKeywordMatches(repositoryText)
  const testingMatches = getTestingKeywordMatches(repositoryText)

  const matchedKeywords: RepositorySignal['matchedKeywords'] = {}

  addMatchedKeywords(matchedKeywords, 'frontend', frontendMatches)
  addMatchedKeywords(matchedKeywords, 'backend', backendMatches)
  addMatchedKeywords(matchedKeywords, 'databases', databaseMatches)
  addMatchedKeywords(matchedKeywords, 'devops', devopsMatches)
  addMatchedKeywords(matchedKeywords, 'systemDesign', systemDesignMatches)
  addMatchedKeywords(matchedKeywords, 'algorithms', algorithmsMatches)
  addMatchedKeywords(matchedKeywords, 'security', securityMatches)
  addMatchedKeywords(matchedKeywords, 'testing', testingMatches)

  const frontendEvidence =
    frontendMatches.length * 2 +
    (languages.some((language) => ['html', 'css', 'scss', 'sass'].includes(language)) ? 2 : 0) +
    (isFrontendLanguageSignal(languages) && frontendMatches.length > 0 ? 1 : 0)

  const backendEvidence =
    backendMatches.length * 2 +
    (isBackendLanguageSignal(languages) ? 1 : 0) +
    (databaseMatches.length > 0 ? 1 : 0) +
    (securityMatches.length > 0 ? 1 : 0)

  const databaseEvidence =
    databaseMatches.length * 2 + (isDatabaseLanguageSignal(languages) ? 2 : 0)

  const devopsEvidence =
    devopsMatches.length * 2 + (isDevopsLanguageSignal(languages) ? 2 : 0)

  const algorithmEvidence = algorithmsMatches.length * 3
  const securityEvidence = securityMatches.length * 2
  const testingEvidence = testingMatches.length * 2

  const frontend = frontendEvidence >= 2
  const backend = backendEvidence >= 2 && frontendEvidence < 5
  const databases = databaseEvidence >= 2
  const devops = devopsEvidence >= 2
  const algorithms = algorithmEvidence >= 3
  const security = securityEvidence >= 2
  const testing = testingEvidence >= 2
  const systemDesign =
    systemDesignMatches.length > 0 || (backend && databases && devops) || (backend && devops)

  if (frontend && frontendMatches.length === 0) {
    addMatchedKeywords(matchedKeywords, 'frontend', ['html/css'])
  }

  if (backend && backendMatches.length === 0 && isBackendLanguageSignal(languages)) {
    addMatchedKeywords(matchedKeywords, 'backend', ['server-language'])
  }

  if (databases && databaseMatches.length === 0 && isDatabaseLanguageSignal(languages)) {
    addMatchedKeywords(matchedKeywords, 'databases', ['sql'])
  }

  if (devops && devopsMatches.length === 0 && isDevopsLanguageSignal(languages)) {
    addMatchedKeywords(matchedKeywords, 'devops', ['dockerfile/shell'])
  }

  if (systemDesign && systemDesignMatches.length === 0 && backend && devops) {
    addMatchedKeywords(matchedKeywords, 'systemDesign', ['backend+devops'])
  }

  const referencePoint =
    repository.lastPushedAt ?? repository.providerUpdatedAt ?? repository.providerCreatedAt

  const hasRecentActivity = repository.commitSummaries.some(
    (summary) =>
      summary.commitCount > 0 &&
      isWithinDays(summary.bucketEnd, RECENT_ACTIVITY_WINDOW_DAYS, referenceDate),
  )

  return {
    repositoryId: repository.id,
    name: repository.name,
    fullName: repository.fullName,
    createdAt: repository.providerCreatedAt,
    updatedAt: repository.providerUpdatedAt,
    lastPushedAt: repository.lastPushedAt,
    primaryLanguage: repository.primaryLanguage,
    languages,
    categories: {
      frontend,
      backend,
      databases,
      devops,
      systemDesign,
      algorithms,
      security,
      testing,
    },
    matchedKeywords,
    isRecent: isWithinDays(referencePoint, RECENT_REPOSITORY_WINDOW_DAYS, referenceDate),
    isActive: hasRecentActivity || isWithinDays(referencePoint, RECENT_ACTIVITY_WINDOW_DAYS, referenceDate),
    hasRecentActivity,
  }
}

function aggregateWeeklyActivity(
  context: AnalysisContext,
): WeeklyActivitySignal[] {
  const weeklyActivityByStart = new Map<
    string,
    { bucketStart: Date; bucketEnd: Date; commitCount: number; activeDays: number }
  >()

  for (const repository of context.repositories) {
    for (const summary of repository.commitSummaries) {
      const key = summary.bucketStart.toISOString()
      const existingSummary = weeklyActivityByStart.get(key)

      if (!existingSummary) {
        weeklyActivityByStart.set(key, {
          bucketStart: summary.bucketStart,
          bucketEnd: summary.bucketEnd,
          commitCount: summary.commitCount,
          activeDays: Math.min(summary.activeDays, 7),
        })
        continue
      }

      existingSummary.commitCount += summary.commitCount
      existingSummary.activeDays = Math.min(existingSummary.activeDays + summary.activeDays, 7)
    }
  }

  return [...weeklyActivityByStart.values()].sort(
    (left, right) => left.bucketStart.getTime() - right.bucketStart.getTime(),
  )
}

export function deriveAnalysisSignals(context: AnalysisContext): DerivedAnalysisSignals {
  const generatedAt = new Date()
  const repositories = context.repositories.map((repository) =>
    evaluateRepositorySignal(repository, generatedAt),
  )
  const weeklyActivity = aggregateWeeklyActivity(context)
  const leetcodeProfile = context.leetcodeProfile
  const codeforcesProfile = context.codeforcesProfile

  const languageBytesByName: Record<string, number> = {}
  const languageFirstSeenMap = new Map<string, LanguageAdoptionSignal>()
  const categoryMilestoneMap = new Map<CategoryMilestoneSignal['category'], CategoryMilestoneSignal>()

  let totalStars = 0
  let totalForks = 0
  let publicRepositoryCount = 0
  let nonForkRepositoryCount = 0
  let archivedRepositoryCount = 0

  for (const repository of context.repositories) {
    const repositoryReferenceDate = pickRepositoryReferenceDate(repository)

    totalStars += repository.starsCount
    totalForks += repository.forksCount

    if (repository.visibility === 'PUBLIC') {
      publicRepositoryCount += 1
    }

    if (!repository.isFork) {
      nonForkRepositoryCount += 1
    }

    if (repository.isArchived) {
      archivedRepositoryCount += 1
    }

    for (const language of repository.languageStats) {
      languageBytesByName[language.languageName] =
        (languageBytesByName[language.languageName] ?? 0) + language.bytesCount
    }

    if (repositoryReferenceDate) {
      const repositoryLanguages = getRepositoryLanguages(repository)

      for (const languageName of repositoryLanguages) {
        const existingLanguage = languageFirstSeenMap.get(languageName)

        if (!existingLanguage || repositoryReferenceDate < existingLanguage.firstSeenAt) {
          languageFirstSeenMap.set(languageName, {
            languageName,
            firstSeenAt: repositoryReferenceDate,
            repositoryFullName: repository.fullName,
          })
        }
      }
    }
  }

  for (const repositorySignal of repositories) {
    if (!repositorySignal.createdAt) {
      continue
    }

    const coreCategoryEntries = [
      ['frontend', repositorySignal.categories.frontend],
      ['backend', repositorySignal.categories.backend],
      ['databases', repositorySignal.categories.databases],
      ['devops', repositorySignal.categories.devops],
      ['systemDesign', repositorySignal.categories.systemDesign],
      ['algorithms', repositorySignal.categories.algorithms],
      ['security', repositorySignal.categories.security],
    ] as const

    for (const [category, hasSignal] of coreCategoryEntries) {
      if (!hasSignal) {
        continue
      }

      const existingMilestone = categoryMilestoneMap.get(category)

      if (!existingMilestone || repositorySignal.createdAt < existingMilestone.firstSeenAt) {
        categoryMilestoneMap.set(category, {
          category,
          firstSeenAt: repositorySignal.createdAt,
          repositoryFullName: repositorySignal.fullName,
        })
      }
    }
  }

  const recentWeeklyActivity = weeklyActivity.filter((summary) =>
    isWithinDays(summary.bucketEnd, RECENT_ACTIVITY_WINDOW_DAYS, generatedAt),
  )
  const priorWeeklyActivity = weeklyActivity.filter((summary) => {
    const ageInDays = Math.floor(
      (generatedAt.getTime() - summary.bucketEnd.getTime()) / (24 * 60 * 60 * 1000),
    )

    return ageInDays > RECENT_ACTIVITY_WINDOW_DAYS && ageInDays <= PRIOR_ACTIVITY_WINDOW_DAYS
  })

  const uniqueLanguages = uniqueStrings([
    ...Object.keys(languageBytesByName),
    ...context.repositories
      .flatMap((repository) => getRepositoryLanguages(repository))
      .map(normalizeTerm),
  ])

  const languageAdoptions = [...languageFirstSeenMap.values()]
    .sort((left, right) => left.firstSeenAt.getTime() - right.firstSeenAt.getTime())
  const recentLanguageAdoptions = [...languageFirstSeenMap.values()]
    .filter((language) => isWithinDays(language.firstSeenAt, RECENT_REPOSITORY_WINDOW_DAYS, generatedAt))
    .sort((left, right) => left.firstSeenAt.getTime() - right.firstSeenAt.getTime())

  const frontendProjectCount = repositories.filter(
    (repository) => repository.categories.frontend,
  ).length
  const backendProjectCount = repositories.filter(
    (repository) => repository.categories.backend,
  ).length
  const databaseProjectCount = repositories.filter(
    (repository) => repository.categories.databases,
  ).length
  const devopsProjectCount = repositories.filter(
    (repository) => repository.categories.devops,
  ).length
  const systemDesignProjectCount = repositories.filter(
    (repository) => repository.categories.systemDesign,
  ).length
  const algorithmProjectCount = repositories.filter(
    (repository) => repository.categories.algorithms,
  ).length
  const securityProjectCount = repositories.filter(
    (repository) => repository.categories.security,
  ).length
  const testingProjectCount = repositories.filter(
    (repository) => repository.categories.testing,
  ).length

  const stackDiversity = [
    frontendProjectCount,
    backendProjectCount,
    databaseProjectCount,
    devopsProjectCount,
    systemDesignProjectCount,
    algorithmProjectCount,
  ].filter((count) => count > 0).length

  const experimentationIndex =
    uniqueLanguages.length + recentLanguageAdoptions.length + stackDiversity

  const latestRepositoryAt = context.repositories
    .map((repository) => repository.providerUpdatedAt ?? repository.lastPushedAt ?? repository.providerCreatedAt)
    .filter((date): date is Date => Boolean(date))
    .sort((left, right) => right.getTime() - left.getTime())[0] ?? null

  const latestActivityAt = weeklyActivity
    .filter((summary) => summary.commitCount > 0)
    .sort((left, right) => right.bucketEnd.getTime() - left.bucketEnd.getTime())[0]?.bucketEnd ?? null

  const firstRepositoryAt = context.repositories
    .map((repository) => repository.providerCreatedAt)
    .filter((date): date is Date => Boolean(date))
    .sort((left, right) => left.getTime() - right.getTime())[0] ?? null

  const leetcodeTopicBreadth = leetcodeProfile
    ? leetcodeProfile.topicStats.filter((topic) => topic.problemsSolved > 0).length
    : 0
  const leetcodeLanguageBreadth = leetcodeProfile
    ? leetcodeProfile.languageStats.filter((language) => language.problemsSolved > 0).length
    : 0
  const codeforcesLatestContestAt = codeforcesProfile?.contestResults
    .map((contest) => contest.ratingUpdateTime)
    .sort((left, right) => right.getTime() - left.getTime())[0] ?? null

  return {
    generatedAt,
    totalRepositories: context.repositories.length,
    publicRepositoryCount,
    nonForkRepositoryCount,
    archivedRepositoryCount,
    activeRepositoryCount: repositories.filter((repository) => repository.isActive).length,
    recentRepositoryCount: repositories.filter((repository) => repository.isRecent).length,
    multiCategoryRepositoryCount: repositories.filter(
      (repository) =>
        Object.values(repository.categories).filter(Boolean).length >= 2,
    ).length,
    totalStars,
    totalForks,
    uniqueLanguages,
    dominantLanguages: topLabelsByValue(languageBytesByName, 3),
    languageBreadth: uniqueLanguages.length,
    frontendProjectCount,
    backendProjectCount,
    databaseProjectCount,
    devopsProjectCount,
    systemDesignProjectCount,
    algorithmProjectCount,
    securityProjectCount,
    testingProjectCount,
    stackDiversity,
    experimentationIndex,
    recentCommitCount: recentWeeklyActivity.reduce(
      (sum, summary) => sum + summary.commitCount,
      0,
    ),
    priorCommitCount: priorWeeklyActivity.reduce(
      (sum, summary) => sum + summary.commitCount,
      0,
    ),
    totalCommitCount: weeklyActivity.reduce((sum, summary) => sum + summary.commitCount, 0),
    recentActiveWeeks: recentWeeklyActivity.filter((summary) => summary.commitCount > 0).length,
    priorActiveWeeks: priorWeeklyActivity.filter((summary) => summary.commitCount > 0).length,
    totalActiveWeeks: weeklyActivity.filter((summary) => summary.commitCount > 0).length,
    averageRecentActiveDays:
      recentWeeklyActivity.length === 0
        ? 0
        : recentWeeklyActivity.reduce((sum, summary) => sum + summary.activeDays, 0) /
          recentWeeklyActivity.length,
    latestRepositoryAt,
    latestActivityAt,
    firstRepositoryAt,
    languageAdoptions,
    recentLanguageAdoptions,
    categoryMilestones: [...categoryMilestoneMap.values()].sort(
      (left, right) => left.firstSeenAt.getTime() - right.firstSeenAt.getTime(),
    ),
    weeklyActivity,
    repositories,
    languageBytesByName,
    leetcodeProfilePresent: Boolean(leetcodeProfile),
    leetcodeTotalSolved: leetcodeProfile?.totalSolved ?? 0,
    leetcodeEasySolved: leetcodeProfile?.easySolved ?? 0,
    leetcodeMediumSolved: leetcodeProfile?.mediumSolved ?? 0,
    leetcodeHardSolved: leetcodeProfile?.hardSolved ?? 0,
    leetcodeCurrentStreak: leetcodeProfile?.currentStreak ?? 0,
    leetcodeTotalActiveDays: leetcodeProfile?.totalActiveDays ?? 0,
    leetcodeTopicBreadth,
    leetcodeLanguageBreadth,
    leetcodeContestParticipationCount: leetcodeProfile?.attendedContestsCount ?? 0,
    leetcodeContestRating: leetcodeProfile?.contestRating ?? null,
    codeforcesProfilePresent: Boolean(codeforcesProfile),
    codeforcesCurrentRating: codeforcesProfile?.currentRating ?? null,
    codeforcesMaxRating: codeforcesProfile?.maxRating ?? null,
    codeforcesContestCount: codeforcesProfile?.totalContests ?? 0,
    codeforcesRecentContestCount: codeforcesProfile?.recentContests ?? 0,
    codeforcesTotalSolvedProblems: codeforcesProfile?.totalSolvedProblems ?? 0,
    codeforcesAcceptedSubmissionCount: codeforcesProfile?.acceptedSubmissionCount ?? 0,
    codeforcesRecentAcceptedProblems: codeforcesProfile?.recentAcceptedProblems ?? 0,
    codeforcesTagBreadth: codeforcesProfile?.tagBreadth ?? 0,
    codeforcesAverageSolvedProblemRating:
      codeforcesProfile?.averageSolvedProblemRating ?? null,
    codeforcesMaxSolvedProblemRating:
      codeforcesProfile?.maxSolvedProblemRating ?? null,
    codeforcesLatestContestAt,
  }
}
