import type { DerivedAnalysisSignals } from '../analysisTypes'
import { clampScore, isWithinDays, scaleToRange } from '../analysisUtils'
import type {
  CodeforcesSourceSignals,
  GithubSourceSignals,
  LeetcodeSourceSignals,
  SourceSignalDimension,
  SourceSignals,
} from './fusionTypes'

const RECENT_WINDOW_DAYS = 180
const PRIOR_WINDOW_DAYS = 360

type CoreCategoryKey =
  | 'algorithms'
  | 'backend'
  | 'frontend'
  | 'databases'
  | 'devops'
  | 'systemDesign'
  | 'security'

function createDimension(score: number, note: string): SourceSignalDimension {
  return {
    score: clampScore(score, 0, 100),
    note,
  }
}

function countRecentCategoryRepositories(
  signals: DerivedAnalysisSignals,
  category: CoreCategoryKey,
) {
  return signals.repositories.filter(
    (repository) =>
      repository.categories[category === 'databases' ? 'databases' : category] &&
      (repository.isRecent || repository.hasRecentActivity),
  ).length
}

function countCategoryKeywordMatches(
  signals: DerivedAnalysisSignals,
  category: CoreCategoryKey,
) {
  return signals.repositories.reduce((count, repository) => {
    return count + (repository.matchedKeywords[category]?.length ?? 0)
  }, 0)
}

function countCategoryRepositoriesWithBreadth(
  signals: DerivedAnalysisSignals,
  category: Exclude<CoreCategoryKey, 'security'>,
) {
  return signals.repositories.filter(
    (repository) =>
      repository.categories[category === 'databases' ? 'databases' : category] &&
      repository.languages.length >= 2,
  ).length
}

function getRecentRepositoryCounts(signals: DerivedAnalysisSignals) {
  let recentRepositoryCreations = 0
  let priorRepositoryCreations = 0

  for (const repository of signals.repositories) {
    if (!repository.createdAt) {
      continue
    }

    const ageInDays = Math.floor(
      (signals.generatedAt.getTime() - repository.createdAt.getTime()) /
        (24 * 60 * 60 * 1000),
    )

    if (ageInDays <= RECENT_WINDOW_DAYS) {
      recentRepositoryCreations += 1
    } else if (ageInDays <= PRIOR_WINDOW_DAYS) {
      priorRepositoryCreations += 1
    }
  }

  return {
    recentRepositoryCreations,
    priorRepositoryCreations,
  }
}

function buildGithubSourceSignals(
  signals: DerivedAnalysisSignals,
): GithubSourceSignals {
  const frontendRecent = countRecentCategoryRepositories(signals, 'frontend')
  const backendRecent = countRecentCategoryRepositories(signals, 'backend')
  const databaseRecent = countRecentCategoryRepositories(signals, 'databases')
  const devopsRecent = countRecentCategoryRepositories(signals, 'devops')
  const algorithmsRecent = countRecentCategoryRepositories(signals, 'algorithms')
  const securityRecent = countRecentCategoryRepositories(signals, 'security')

  const frontendKeywords = countCategoryKeywordMatches(signals, 'frontend')
  const backendKeywords = countCategoryKeywordMatches(signals, 'backend')
  const databaseKeywords = countCategoryKeywordMatches(signals, 'databases')
  const devopsKeywords = countCategoryKeywordMatches(signals, 'devops')
  const systemKeywords = countCategoryKeywordMatches(signals, 'systemDesign')
  const algorithmKeywords = countCategoryKeywordMatches(signals, 'algorithms')
  const securityKeywords = countCategoryKeywordMatches(signals, 'security')

  const frontendBreadth = countCategoryRepositoriesWithBreadth(signals, 'frontend')
  const backendBreadth = countCategoryRepositoriesWithBreadth(signals, 'backend')
  const databaseBreadth = countCategoryRepositoriesWithBreadth(signals, 'databases')
  const devopsBreadth = countCategoryRepositoriesWithBreadth(signals, 'devops')

  const { recentRepositoryCreations, priorRepositoryCreations } =
    getRecentRepositoryCounts(signals)

  const commitGrowth =
    signals.priorCommitCount === 0
      ? signals.recentCommitCount > 0
        ? 1
        : 0
      : (signals.recentCommitCount - signals.priorCommitCount) / signals.priorCommitCount

  const activeWeekGrowth =
    signals.priorActiveWeeks === 0
      ? signals.recentActiveWeeks > 0
        ? 1
        : 0
      : (signals.recentActiveWeeks - signals.priorActiveWeeks) / signals.priorActiveWeeks

  const frontend = createDimension(
    12 +
      scaleToRange(signals.frontendProjectCount, 6, 34) +
      scaleToRange(frontendRecent, 4, 16) +
      scaleToRange(frontendKeywords, 8, 18) +
      scaleToRange(frontendBreadth, 4, 10) +
      scaleToRange(signals.multiCategoryRepositoryCount, 5, 8),
    `${signals.frontendProjectCount} GitHub repositories show frontend signals, with ${frontendRecent} showing recent movement.`,
  )

  const backend = createDimension(
    14 +
      scaleToRange(signals.backendProjectCount, 6, 32) +
      scaleToRange(backendRecent, 4, 16) +
      scaleToRange(backendKeywords, 8, 18) +
      scaleToRange(backendBreadth, 4, 10) +
      scaleToRange(signals.databaseProjectCount + signals.devopsProjectCount, 8, 8),
    `${signals.backendProjectCount} GitHub repositories show API, service, or backend-system signals.`,
  )

  const databases = createDimension(
    12 +
      scaleToRange(signals.databaseProjectCount, 5, 34) +
      scaleToRange(databaseRecent, 4, 14) +
      scaleToRange(databaseKeywords, 8, 22) +
      scaleToRange(databaseBreadth, 3, 8) +
      scaleToRange(signals.backendProjectCount, 6, 8),
    `${signals.databaseProjectCount} repositories reference storage, SQL, or persistence tooling.`,
  )

  const devops = createDimension(
    10 +
      scaleToRange(signals.devopsProjectCount, 5, 36) +
      scaleToRange(devopsRecent, 4, 14) +
      scaleToRange(devopsKeywords, 8, 22) +
      scaleToRange(devopsBreadth, 3, 8) +
      scaleToRange(signals.backendProjectCount, 6, 8),
    `${signals.devopsProjectCount} repositories contribute CI/CD, deployment, or infrastructure evidence.`,
  )

  const systemDesign = createDimension(
    14 +
      scaleToRange(signals.systemDesignProjectCount, 4, 24) +
      scaleToRange(systemKeywords, 4, 24) +
      scaleToRange(
        signals.repositories.filter(
          (repository) =>
            repository.categories.backend &&
            repository.categories.databases &&
            repository.categories.devops,
        ).length,
        3,
        18,
      ) +
      scaleToRange(signals.nonForkRepositoryCount, 8, 8) +
      scaleToRange(signals.totalStars, 25, 6),
    `${signals.systemDesignProjectCount} repositories show multi-layer architecture or systems signals.`,
  )

  const algorithms = createDimension(
    10 +
      scaleToRange(signals.algorithmProjectCount, 4, 28) +
      scaleToRange(algorithmKeywords, 6, 24) +
      scaleToRange(algorithmsRecent, 3, 10) +
      scaleToRange(signals.totalActiveWeeks, 16, 8),
    `${signals.algorithmProjectCount} GitHub repositories contain explicit algorithms or interview-style metadata signals.`,
  )

  const security = createDimension(
    12 +
      scaleToRange(signals.securityProjectCount, 4, 24) +
      scaleToRange(securityKeywords, 6, 20) +
      scaleToRange(securityRecent, 3, 10) +
      scaleToRange(signals.backendProjectCount + signals.devopsProjectCount, 8, 10) +
      scaleToRange(signals.publicRepositoryCount, 10, 8),
    `${signals.securityProjectCount} repositories reference security, auth, or permissions work.`,
  )

  const collaboration = createDimension(
    20 +
      scaleToRange(signals.publicRepositoryCount, 10, 24) +
      scaleToRange(signals.totalStars, 30, 18) +
      scaleToRange(signals.totalForks, 10, 10) +
      scaleToRange(signals.activeRepositoryCount, 6, 14) +
      scaleToRange(signals.nonForkRepositoryCount, 10, 8),
    `${signals.publicRepositoryCount} public repositories and ${signals.totalStars} stars provide visible collaboration evidence.`,
  )

  const projectExecution = createDimension(
    18 +
      scaleToRange(signals.totalRepositories, 10, 24) +
      scaleToRange(signals.activeRepositoryCount, 6, 18) +
      scaleToRange(signals.recentCommitCount, 80, 14) +
      scaleToRange(signals.multiCategoryRepositoryCount, 5, 10) +
      scaleToRange(signals.nonForkRepositoryCount, 10, 8),
    `${signals.totalRepositories} synced repositories and ${signals.activeRepositoryCount} active projects anchor the builder signal.`,
  )

  const exploration = createDimension(
    18 +
      scaleToRange(signals.languageBreadth, 10, 24) +
      scaleToRange(signals.stackDiversity, 6, 20) +
      scaleToRange(signals.recentLanguageAdoptions.length, 4, 18) +
      scaleToRange(signals.recentRepositoryCount, 6, 10) +
      scaleToRange(signals.experimentationIndex, 20, 10),
    `${signals.languageBreadth} languages and ${signals.recentLanguageAdoptions.length} recent stack-adoption signals show exploration through real projects.`,
  )

  const growth = createDimension(
    12 +
      scaleToRange(signals.recentLanguageAdoptions.length, 4, 22) +
      scaleToRange(recentRepositoryCreations, 4, 16) +
      scaleToRange(Math.max(commitGrowth, 0), 1.5, 18) +
      scaleToRange(Math.max(activeWeekGrowth, 0), 1.5, 14) +
      scaleToRange(signals.recentRepositoryCount, 6, 8),
    `${recentRepositoryCreations} recent repositories and ${signals.recentActiveWeeks} active weeks describe the current GitHub growth arc.`,
  )

  const problemSolving = createDimension(
    algorithms.score * 0.66 +
      scaleToRange(signals.totalActiveWeeks, 16, 14) +
      scaleToRange(signals.languageBreadth, 10, 8) +
      scaleToRange(signals.algorithmProjectCount, 4, 8),
    `${signals.algorithmProjectCount} algorithm-leaning repositories plus sustained weekly activity contribute project-based problem-solving evidence.`,
  )

  const interview = createDimension(
    algorithms.score * 0.22 +
      backend.score * 0.28 +
      systemDesign.score * 0.24 +
      scaleToRange(signals.totalActiveWeeks, 16, 14) +
      scaleToRange(signals.multiCategoryRepositoryCount, 5, 8),
    'GitHub contributes implementation depth, systems thinking, and delivery consistency to interview-readiness.',
  )

  return {
    available: signals.totalRepositories > 0,
    summary:
      signals.totalRepositories > 0
        ? 'GitHub contributes project execution, shipping rhythm, and stack breadth.'
        : 'GitHub has not contributed synced repository metadata yet.',
    projectExecution,
    frontend,
    backend,
    databases,
    devops,
    systemDesign,
    algorithms,
    security,
    collaboration,
    exploration,
    growth,
    problemSolving,
    interview,
  }
}

function buildLeetcodeSourceSignals(
  signals: DerivedAnalysisSignals,
): LeetcodeSourceSignals {
  const difficultyBreadth = [
    signals.leetcodeEasySolved,
    signals.leetcodeMediumSolved,
    signals.leetcodeHardSolved,
  ].filter((count) => count > 0).length

  const available =
    signals.leetcodeProfilePresent &&
    (signals.leetcodeTotalSolved > 0 ||
      signals.leetcodeCurrentStreak > 0 ||
      signals.leetcodeTopicBreadth > 0 ||
      signals.leetcodeContestParticipationCount > 0)

  return {
    available,
    summary: available
      ? 'LeetCode contributes deliberate practice, difficulty mix, and topic breadth.'
      : 'LeetCode has not contributed meaningful practice data yet.',
    algorithms: createDimension(
      14 +
        scaleToRange(signals.leetcodeTotalSolved, 400, 34) +
        scaleToRange(signals.leetcodeMediumSolved, 250, 12) +
        scaleToRange(signals.leetcodeHardSolved, 80, 18) +
        scaleToRange(signals.leetcodeTopicBreadth, 20, 10) +
        scaleToRange(signals.leetcodeCurrentStreak, 30, 8) +
        scaleToRange(signals.leetcodeContestParticipationCount, 12, 4),
      `${signals.leetcodeTotalSolved} solved LeetCode problems, including ${signals.leetcodeHardSolved} hard solves, provide direct algorithms evidence.`,
    ),
    exploration: createDimension(
      8 +
        scaleToRange(signals.leetcodeTopicBreadth, 20, 28) +
        scaleToRange(signals.leetcodeLanguageBreadth, 5, 10) +
        scaleToRange(difficultyBreadth, 3, 8),
      `${signals.leetcodeTopicBreadth} covered LeetCode topics widen the visible problem-space exposure.`,
    ),
    growth: createDimension(
      10 +
        scaleToRange(signals.leetcodeCurrentStreak, 30, 28) +
        scaleToRange(signals.leetcodeTotalActiveDays, 365, 12) +
        scaleToRange(signals.leetcodeContestParticipationCount, 12, 6) +
        scaleToRange(signals.leetcodeTopicBreadth, 20, 6),
      `${signals.leetcodeCurrentStreak}-day LeetCode streak adds recent deliberate-practice momentum.`,
    ),
    problemSolving: createDimension(
      16 +
        scaleToRange(signals.leetcodeTotalSolved, 400, 28) +
        scaleToRange(signals.leetcodeHardSolved, 80, 20) +
        scaleToRange(signals.leetcodeTopicBreadth, 20, 10) +
        scaleToRange(signals.leetcodeCurrentStreak, 30, 10) +
        scaleToRange(signals.leetcodeContestParticipationCount, 12, 6),
      `${signals.leetcodeHardSolved} hard solves and ${signals.leetcodeTopicBreadth} covered topics strengthen deliberate problem-solving confidence.`,
    ),
    interview: createDimension(
      18 +
        scaleToRange(signals.leetcodeTotalSolved, 350, 24) +
        scaleToRange(signals.leetcodeMediumSolved, 220, 12) +
        scaleToRange(signals.leetcodeHardSolved, 70, 18) +
        scaleToRange(signals.leetcodeTopicBreadth, 20, 10) +
        scaleToRange(signals.leetcodeCurrentStreak, 30, 8) +
        scaleToRange(signals.leetcodeContestRating ?? 0, 2200, 4),
      'LeetCode contributes explicit interview-style practice, especially through medium and hard problem coverage.',
    ),
  }
}

function buildCodeforcesSourceSignals(
  signals: DerivedAnalysisSignals,
): CodeforcesSourceSignals {
  const available =
    signals.codeforcesProfilePresent &&
    (signals.codeforcesTotalSolvedProblems > 0 ||
      signals.codeforcesContestCount > 0 ||
      signals.codeforcesCurrentRating !== null ||
      signals.codeforcesRecentAcceptedProblems > 0)

  const currentToMaxRatingRatio =
    signals.codeforcesCurrentRating !== null &&
    signals.codeforcesMaxRating !== null &&
    signals.codeforcesMaxRating > 0
      ? signals.codeforcesCurrentRating / signals.codeforcesMaxRating
      : 0

  const hasRecentContestWindow = isWithinDays(
    signals.codeforcesLatestContestAt,
    120,
    signals.generatedAt,
  )

  return {
    available,
    summary: available
      ? 'Codeforces contributes contest performance, harder-problem exposure, and rating depth.'
      : 'Codeforces has not contributed meaningful contest or solved-problem data yet.',
    algorithms: createDimension(
      14 +
        scaleToRange(signals.codeforcesTotalSolvedProblems, 500, 24) +
        scaleToRange(signals.codeforcesCurrentRating ?? 0, 2000, 18) +
        scaleToRange(signals.codeforcesMaxRating ?? 0, 2400, 10) +
        scaleToRange(signals.codeforcesRecentAcceptedProblems, 80, 10) +
        scaleToRange(signals.codeforcesContestCount, 20, 6) +
        scaleToRange(signals.codeforcesTagBreadth, 20, 8),
      `${signals.codeforcesTotalSolvedProblems} solved Codeforces problems and rating ${signals.codeforcesCurrentRating ?? 'unrated'} add advanced problem-solving evidence.`,
    ),
    exploration: createDimension(
      8 +
        scaleToRange(signals.codeforcesTagBreadth, 20, 24) +
        scaleToRange(signals.codeforcesContestCount, 20, 8) +
        scaleToRange(signals.codeforcesTotalSolvedProblems, 500, 8),
      `${signals.codeforcesTagBreadth} Codeforces tags widen visible exposure across problem categories.`,
    ),
    growth: createDimension(
      8 +
        scaleToRange(signals.codeforcesRecentContestCount, 6, 24) +
        scaleToRange(signals.codeforcesRecentAcceptedProblems, 80, 18) +
        scaleToRange(currentToMaxRatingRatio, 1, 12) +
        (hasRecentContestWindow ? 8 : 0),
      `${signals.codeforcesRecentContestCount} recent contests and ${signals.codeforcesRecentAcceptedProblems} recently solved Codeforces problems add current competitive momentum.`,
    ),
    problemSolving: createDimension(
      18 +
        scaleToRange(signals.codeforcesCurrentRating ?? 0, 2000, 20) +
        scaleToRange(signals.codeforcesMaxRating ?? 0, 2400, 12) +
        scaleToRange(signals.codeforcesTotalSolvedProblems, 500, 18) +
        scaleToRange(signals.codeforcesRecentAcceptedProblems, 80, 12) +
        scaleToRange(signals.codeforcesTagBreadth, 20, 8) +
        scaleToRange(signals.codeforcesRecentContestCount, 6, 6),
      `${signals.codeforcesContestCount} rated contests and ${signals.codeforcesTagBreadth} tag signals reinforce competitive problem-solving depth.`,
    ),
    interview: createDimension(
      12 +
        scaleToRange(signals.codeforcesCurrentRating ?? 0, 1900, 22) +
        scaleToRange(signals.codeforcesMaxRating ?? 0, 2400, 10) +
        scaleToRange(signals.codeforcesTotalSolvedProblems, 450, 18) +
        scaleToRange(signals.codeforcesAverageSolvedProblemRating ?? 0, 1800, 10) +
        scaleToRange(signals.codeforcesMaxSolvedProblemRating ?? 0, 2600, 8) +
        scaleToRange(signals.codeforcesRecentAcceptedProblems, 80, 8) +
        scaleToRange(signals.codeforcesTagBreadth, 20, 6),
      'Codeforces contributes advanced contest-grade problem-solving and rating-backed interview-readiness evidence.',
    ),
  }
}

export function buildSourceSignals(
  signals: DerivedAnalysisSignals,
): SourceSignals {
  return {
    github: buildGithubSourceSignals(signals),
    leetcode: buildLeetcodeSourceSignals(signals),
    codeforces: buildCodeforcesSourceSignals(signals),
  }
}
