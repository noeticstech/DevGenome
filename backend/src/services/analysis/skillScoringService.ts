import type {
  AnalysisSkillCategory,
  AnalysisSource,
  DerivedAnalysisSignals,
  SkillScoringResult,
} from './analysisTypes'
import { clampScore } from './analysisUtils'
import type { FusedAnalysisSignals, FusedDimension } from './fusion/fusionTypes'

function countRecentCategoryRepositories(
  signals: DerivedAnalysisSignals,
  category: Exclude<AnalysisSkillCategory, 'collaboration'>,
) {
  return signals.repositories.filter(
    (repository) =>
      repository.categories[category === 'databases' ? 'databases' : category] &&
      (repository.isRecent || repository.hasRecentActivity),
  ).length
}

function countCategoryKeywordMatches(
  signals: DerivedAnalysisSignals,
  category: Exclude<AnalysisSkillCategory, 'collaboration'>,
) {
  return signals.repositories.reduce((count, repository) => {
    return count + (repository.matchedKeywords[category]?.length ?? 0)
  }, 0)
}

function humanizeSource(source: AnalysisSource) {
  const labels: Record<AnalysisSource, string> = {
    github: 'GitHub',
    leetcode: 'LeetCode',
    codeforces: 'Codeforces',
  }

  return labels[source]
}

function describeSourceBlend(
  dimension: FusedDimension,
  fallback: string,
) {
  if (dimension.contributions.length === 0) {
    return fallback
  }

  const sources = dimension.contributions
    .slice(0, 2)
    .map((contribution) => humanizeSource(contribution.source))

  if (sources.length === 1) {
    return `${sources[0]} is the primary evidence source for this category in the current fusion model.`
  }

  return `${sources.join(' and ')} both contribute meaningful weighted evidence, with direct practice sources favored where they exist.`
}

function createDetail(
  score: number,
  reasons: string[],
  dimension: FusedDimension,
) {
  return {
    score: clampScore(score, 8, 96),
    reasons: reasons.slice(0, 3),
    sourceContributions: dimension.contributions,
  }
}

export function calculateSkillScores(
  signals: DerivedAnalysisSignals,
  fusion: FusedAnalysisSignals,
): SkillScoringResult {
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
  const algorithmKeywords = countCategoryKeywordMatches(signals, 'algorithms')
  const securityKeywords = countCategoryKeywordMatches(signals, 'security')

  const frontendDimension = fusion.categorySignals.frontend
  const backendDimension = fusion.categorySignals.backend
  const databaseDimension = fusion.categorySignals.databases
  const devopsDimension = fusion.categorySignals.devops
  const systemDesignDimension = fusion.categorySignals.systemDesign
  const algorithmsDimension = fusion.categorySignals.algorithms
  const securityDimension = fusion.categorySignals.security
  const collaborationDimension = fusion.categorySignals.collaboration

  const algorithmsPrimaryReason =
    algorithmsDimension.contributions.length > 1
      ? `Algorithms scoring blends project metadata with direct practice from ${algorithmsDimension.contributions
          .slice(0, 2)
          .map((contribution) => humanizeSource(contribution.source))
          .join(' and ')}.`
      : algorithmsDimension.contributions[0]?.source === 'codeforces'
        ? `Codeforces contributes ${signals.codeforcesTotalSolvedProblems} solved problems, rating ${signals.codeforcesCurrentRating ?? 'unrated'}, and ${signals.codeforcesContestCount} rated contests.`
        : algorithmsDimension.contributions[0]?.source === 'leetcode'
          ? `LeetCode contributes ${signals.leetcodeTotalSolved} solved problems, including ${signals.leetcodeHardSolved} hard solves and a ${signals.leetcodeCurrentStreak}-day streak.`
          : `${signals.algorithmProjectCount} repositories contain explicit problem-solving or algorithms signals.`

  const algorithmsSecondaryReason =
    algorithmsDimension.explanation[0] ??
    (algorithmKeywords > 0
      ? `Algorithms-focused keywords appeared ${algorithmKeywords} times in synced repository metadata.`
      : 'Algorithms scoring stays intentionally conservative when direct practice evidence is thin.')

  const frontendScore = createDetail(
    frontendDimension.score,
    [
      `${signals.frontendProjectCount} repositories show frontend product signals.`,
      frontendKeywords > 0
        ? `UI-focused framework keywords appeared ${frontendKeywords} times across synced metadata.`
        : 'Frontend scoring stays conservative unless repository metadata clearly points to UI work.',
      frontendRecent > 0
        ? `${frontendRecent} frontend-leaning repositories have recent activity.`
        : 'Recent frontend activity signals are limited.',
    ],
    frontendDimension,
  )

  const backendScore = createDetail(
    backendDimension.score,
    [
      `${signals.backendProjectCount} repositories show API, service, or backend infrastructure signals.`,
      backendKeywords > 0
        ? `Backend-oriented keywords appeared ${backendKeywords} times in repository metadata.`
        : describeSourceBlend(
            backendDimension,
            'Backend evidence is inferred conservatively when metadata is sparse.',
          ),
      backendRecent > 0
        ? `${backendRecent} backend-leaning repositories show recent movement.`
        : 'Recent backend activity signals are limited.',
    ],
    backendDimension,
  )

  const databaseScore = createDetail(
    databaseDimension.score,
    [
      `${signals.databaseProjectCount} repositories reference databases, ORMs, or SQL-oriented tooling.`,
      databaseKeywords > 0
        ? `Database keywords appeared ${databaseKeywords} times in repository descriptions, topics, or language metadata.`
        : describeSourceBlend(
            databaseDimension,
            'Database scoring stays modest when storage signals are indirect.',
          ),
      databaseRecent > 0
        ? `${databaseRecent} database-oriented repositories have recent activity or updates.`
        : 'Recent database activity signals are limited.',
    ],
    databaseDimension,
  )

  const devopsScore = createDetail(
    devopsDimension.score,
    [
      `${signals.devopsProjectCount} repositories show deployment, infrastructure, or CI/CD signals.`,
      devopsKeywords > 0
        ? `DevOps keywords appeared ${devopsKeywords} times across synced repository metadata.`
        : describeSourceBlend(
            devopsDimension,
            'DevOps scoring is conservative without clear infrastructure keywords.',
          ),
      devopsRecent > 0
        ? `${devopsRecent} infrastructure-leaning repositories have recent activity.`
        : 'Recent infrastructure activity signals are limited.',
    ],
    devopsDimension,
  )

  const systemDesignScore = createDetail(
    systemDesignDimension.score,
    [
      `${signals.systemDesignProjectCount} repositories show architecture or multi-layer system signals.`,
      systemDesignDimension.explanation[0] ??
        'System design is scored conservatively because repository metadata is a weak proxy for deep architecture skill.',
      signals.multiCategoryRepositoryCount > 0
        ? `${signals.multiCategoryRepositoryCount} repositories span multiple technical layers, which lifts system design confidence.`
        : 'Cross-layer project evidence is still limited.',
    ],
    systemDesignDimension,
  )

  const algorithmsScore = createDetail(
    algorithmsDimension.score,
    [
      algorithmsPrimaryReason,
      algorithmsSecondaryReason,
      algorithmsRecent > 0
        ? `${algorithmsRecent} algorithm-oriented repositories show recent movement.`
        : algorithmsDimension.contributions.length > 0
          ? 'Repository-side algorithms activity is limited, but external practice sources add direct problem-solving evidence.'
          : 'Recent algorithms-specific activity signals are limited.',
    ],
    algorithmsDimension,
  )

  const securityScore = createDetail(
    securityDimension.score,
    [
      `${signals.securityProjectCount} repositories reference auth, security, or access-control signals.`,
      securityKeywords > 0
        ? `Security-related keywords appeared ${securityKeywords} times across repository metadata.`
        : describeSourceBlend(
            securityDimension,
            'Security scoring remains conservative without explicit auth or security metadata.',
          ),
      securityRecent > 0
        ? `${securityRecent} security-leaning repositories have recent updates or activity.`
        : 'Recent security-specific activity signals are limited.',
    ],
    securityDimension,
  )

  const collaborationScore = createDetail(
    collaborationDimension.score,
    [
      `${signals.publicRepositoryCount} repositories are public, which increases visible collaboration signals.`,
      signals.totalStars > 0 || signals.totalForks > 0
        ? `External engagement signals include ${signals.totalStars} stars and ${signals.totalForks} forks across synced repositories.`
        : 'External engagement signals are still limited, so collaboration scoring stays moderate.',
      `${signals.activeRepositoryCount} repositories show recent shipping or update activity.`,
    ],
    collaborationDimension,
  )

  const scores = {
    algorithms: algorithmsScore,
    backend: backendScore,
    frontend: frontendScore,
    databases: databaseScore,
    devops: devopsScore,
    systemDesign: systemDesignScore,
    security: securityScore,
    collaboration: collaborationScore,
  }

  const strongestCategories = Object.entries(scores)
    .sort((left, right) => right[1].score - left[1].score)
    .slice(0, 3)
    .map(([category]) => category as AnalysisSkillCategory)

  return {
    scores,
    strongestCategories,
  }
}
