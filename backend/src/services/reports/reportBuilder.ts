import {
  buildAnalysisSnapshotCacheSalt,
  getCachedAnalysisSnapshotForUser,
  getInterviewReadinessLabel,
  getTopContributingSources,
} from '../analysis'
import { buildGeminiInsightSourceData } from '../ai/geminiInputBuilder'
import type { DeveloperReportType } from '../../types/api/reports'
import {
  REPORT_TEMPLATES,
  type DeveloperReportInput,
  type DeveloperReportMetricInput,
  type DeveloperReportSourceData,
} from './reportTypes'

const RECENT_WINDOW_DAYS = 180
const PRIOR_WINDOW_DAYS = 360

function getRecentRepositoryCounts(
  repositories: Array<{ createdAt: Date | null }>,
  referenceDate: Date,
) {
  let recent = 0
  let prior = 0

  for (const repository of repositories) {
    if (!repository.createdAt) {
      continue
    }

    const ageInDays = Math.floor(
      (referenceDate.getTime() - repository.createdAt.getTime()) / (24 * 60 * 60 * 1000),
    )

    if (ageInDays <= RECENT_WINDOW_DAYS) {
      recent += 1
    } else if (ageInDays <= PRIOR_WINDOW_DAYS) {
      prior += 1
    }
  }

  return { recent, prior }
}

function humanizeSource(source: string) {
  if (source === 'leetcode') {
    return 'LeetCode'
  }

  if (source === 'codeforces') {
    return 'Codeforces'
  }

  return 'GitHub'
}

function buildRecentCompetitiveSignals(input: {
  leetcode: DeveloperReportInput['competitiveSignals']['leetcode']
  codeforces: DeveloperReportInput['competitiveSignals']['codeforces']
}) {
  const signals: string[] = []

  if (input.leetcode) {
    signals.push(
      `${input.leetcode.totalSolved} total LeetCode solves with a ${input.leetcode.currentStreak}-day streak`,
    )
  }

  if (input.codeforces) {
    signals.push(
      `${input.codeforces.recentContestCount} recent Codeforces contests and ${input.codeforces.totalSolvedProblems} total solved problems`,
    )
  }

  return signals
}

function buildDeterministicMetrics(input: {
  reportType: DeveloperReportType
  reportInput: Omit<DeveloperReportInput, 'deterministicMetrics' | 'deterministicHighlights'>
}) {
  const metrics: DeveloperReportMetricInput[] = []

  if (input.reportType === 'genome_summary') {
    metrics.push(
      {
        key: 'genome_score',
        label: 'Genome Score',
        value: `${input.reportInput.genome.overallScore}`,
        context: input.reportInput.genome.statusLabel,
      },
      {
        key: 'archetype',
        label: 'Archetype',
        value: input.reportInput.genome.developerTypeLabel,
        context: input.reportInput.genome.summary,
      },
      {
        key: 'learning_velocity',
        label: 'Learning Velocity',
        value: input.reportInput.genome.learningVelocity,
        context: `${input.reportInput.activity.recentActiveWeeks} recent active weeks`,
      },
      {
        key: 'interview_readiness',
        label: 'Interview Readiness',
        value: `${input.reportInput.fusion.interviewReadiness.score}`,
        context: input.reportInput.fusion.interviewReadiness.label,
      },
    )
  }

  if (input.reportType === 'monthly_growth') {
    metrics.push(
      {
        key: 'recent_commits',
        label: 'Recent Commits',
        value: `${input.reportInput.changes.commitActivity.recent}`,
        context: `${input.reportInput.changes.commitActivity.prior} in the prior comparison window`,
      },
      {
        key: 'recent_active_weeks',
        label: 'Recent Active Weeks',
        value: `${input.reportInput.changes.activeWeeks.recent}`,
        context: `${input.reportInput.changes.activeWeeks.prior} in the prior window`,
      },
      {
        key: 'new_repositories',
        label: 'Recent Repositories',
        value: `${input.reportInput.changes.repositoryCreations.recent}`,
        context: `${input.reportInput.changes.repositoryCreations.prior} in the prior window`,
      },
      {
        key: 'new_stack_signals',
        label: 'New Stack Signals',
        value: `${input.reportInput.changes.newLanguageAdoptions.length}`,
        context: input.reportInput.changes.newLanguageAdoptions.slice(0, 3).join(', ') || 'No recent new language signals',
      },
    )
  }

  if (input.reportType === 'skill_gap_action') {
    metrics.push(
      {
        key: 'target_role',
        label: 'Target Role',
        value: input.reportInput.roleFit.preferredRole,
        context: null,
      },
      {
        key: 'readiness_score',
        label: 'Readiness',
        value: `${input.reportInput.roleFit.readinessScore}%`,
        context: input.reportInput.roleFit.summary,
      },
      {
        key: 'strongest_categories',
        label: 'Strongest Categories',
        value: input.reportInput.genome.strongestCategories.slice(0, 2).join(', ') || 'Still emerging',
        context: null,
      },
      {
        key: 'highest_priority_gaps',
        label: 'Priority Gaps',
        value: `${input.reportInput.roleFit.missingSkills.length}`,
        context: input.reportInput.roleFit.missingSkills.slice(0, 3).join(', ') || 'No major tracked gaps',
      },
    )
  }

  if (input.reportType === 'interview_readiness') {
    metrics.push(
      {
        key: 'interview_readiness',
        label: 'Interview Readiness',
        value: `${input.reportInput.fusion.interviewReadiness.score}`,
        context: input.reportInput.fusion.interviewReadiness.label,
      },
      {
        key: 'algorithms_score',
        label: 'Algorithms Score',
        value: `${input.reportInput.genome.skillScores.find((skill) => skill.key === 'algorithms')?.score ?? 0}`,
        context: input.reportInput.genome.skillScores.find((skill) => skill.key === 'algorithms')?.label ?? 'Algorithms',
      },
      {
        key: 'problem_solving_sources',
        label: 'Top Sources',
        value: input.reportInput.fusion.problemSolving.topSources.map(humanizeSource).join(', ') || 'Metadata only',
        context: null,
      },
      {
        key: 'recent_practice',
        label: 'Recent Practice',
        value: `${input.reportInput.changes.recentCompetitiveSignals.length}`,
        context: input.reportInput.changes.recentCompetitiveSignals.slice(0, 2).join('; ') || 'No recent direct practice signals',
      },
    )
  }

  return metrics
}

function buildDeterministicHighlights(input: {
  reportType: DeveloperReportType
  reportInput: Omit<DeveloperReportInput, 'deterministicMetrics' | 'deterministicHighlights'>
}) {
  const highlights = [
    `${input.reportInput.genome.developerTypeLabel} profile with strongest categories in ${input.reportInput.genome.strongestCategories.slice(0, 2).join(', ') || 'still-emerging areas'}.`,
    `${input.reportInput.activity.repositoryCount} synced repositories and ${input.reportInput.activity.languageBreadth} detected languages form the current metadata baseline.`,
  ]

  if (input.reportInput.fusion.problemSolving.topSources.length > 0) {
    highlights.push(
      `Problem-solving confidence is most influenced by ${input.reportInput.fusion.problemSolving.topSources.map(humanizeSource).join(', ')}.`,
    )
  }

  if (input.reportType === 'monthly_growth') {
    highlights.push(
      'Monthly growth is described from recent stored activity windows, not exact calendar-month deltas.',
    )
  }

  if (input.reportType === 'skill_gap_action') {
    highlights.push(
      `${input.reportInput.roleFit.preferredRole} is the current target role for action planning.`,
    )
  }

  if (input.reportType === 'interview_readiness') {
    highlights.push(
      `Interview-readiness is currently rated ${input.reportInput.fusion.interviewReadiness.label}.`,
    )
  }

  return highlights
}

export async function buildDeveloperReportSourceData(
  userId: string,
  reportType: DeveloperReportType,
): Promise<DeveloperReportSourceData> {
  const insightSourceData = await buildGeminiInsightSourceData(userId)

  if (insightSourceData.availability !== 'ready' || !insightSourceData.input) {
    return {
      availability: insightSourceData.availability,
      state: insightSourceData.state,
      basedOnAnalysisAt: insightSourceData.basedOnAnalysisAt,
      basedOnSyncAt: insightSourceData.basedOnSyncAt,
      warnings: insightSourceData.warnings,
      emptyMessage: insightSourceData.emptyMessage,
      input: null,
    }
  }

  const analysisSnapshot = await getCachedAnalysisSnapshotForUser({
    userId,
    cacheSalt: buildAnalysisSnapshotCacheSalt({
      state: insightSourceData.state,
      lastSyncAt: insightSourceData.basedOnSyncAt,
      repositoryCount: insightSourceData.input.activity.repositoryCount,
      languageCount: insightSourceData.input.activity.languageBreadth,
    }),
  })
  const { signals, fusion } = analysisSnapshot
  const recentRepositoryCounts = getRecentRepositoryCounts(
    signals.repositories.map((repository) => ({ createdAt: repository.createdAt })),
    signals.generatedAt,
  )

  const reportInputBase = {
    reportType,
    template: REPORT_TEMPLATES[reportType],
    user: insightSourceData.input.user,
    productState: insightSourceData.input.productState,
    genome: insightSourceData.input.genome,
    roleFit: insightSourceData.input.roleFit,
    activity: insightSourceData.input.activity,
    competitiveSignals: insightSourceData.input.competitiveSignals,
    timeline: insightSourceData.input.timeline,
    fusion: {
      interviewReadiness: {
        score: fusion.interviewReadiness.score,
        label: getInterviewReadinessLabel(fusion.interviewReadiness.score),
        topSources: getTopContributingSources(fusion.interviewReadiness, 3),
        explanation: fusion.interviewReadiness.explanation,
      },
      growthMomentum: {
        score: fusion.growthMomentum.score,
        topSources: getTopContributingSources(fusion.growthMomentum, 3),
        explanation: fusion.growthMomentum.explanation,
      },
      problemSolving: {
        score: fusion.problemSolvingStrength.score,
        topSources: getTopContributingSources(fusion.problemSolvingStrength, 3),
        explanation: fusion.problemSolvingStrength.explanation,
      },
    },
    changes: {
      repositoryCreations: recentRepositoryCounts,
      commitActivity: {
        recent: signals.recentCommitCount,
        prior: signals.priorCommitCount,
      },
      activeWeeks: {
        recent: signals.recentActiveWeeks,
        prior: signals.priorActiveWeeks,
      },
      newLanguageAdoptions: signals.recentLanguageAdoptions
        .slice(0, 5)
        .map((adoption) => adoption.languageName),
      recentCompetitiveSignals: buildRecentCompetitiveSignals({
        leetcode: insightSourceData.input.competitiveSignals.leetcode,
        codeforces: insightSourceData.input.competitiveSignals.codeforces,
      }),
    },
    limitations: reportType === 'monthly_growth'
      ? [
          ...insightSourceData.input.limitations,
          'Monthly growth copy must stay grounded in recent stored windows rather than exact calendar-month measurements.',
        ]
      : insightSourceData.input.limitations,
  } satisfies Omit<DeveloperReportInput, 'deterministicMetrics' | 'deterministicHighlights'>

  const input: DeveloperReportInput = {
    ...reportInputBase,
    deterministicMetrics: buildDeterministicMetrics({
      reportType,
      reportInput: reportInputBase,
    }),
    deterministicHighlights: buildDeterministicHighlights({
      reportType,
      reportInput: reportInputBase,
    }),
  }

  return {
    availability: 'ready',
    state: insightSourceData.state,
    basedOnAnalysisAt: insightSourceData.basedOnAnalysisAt,
    basedOnSyncAt: insightSourceData.basedOnSyncAt,
    warnings: insightSourceData.warnings,
    emptyMessage: null,
    input,
  }
}
