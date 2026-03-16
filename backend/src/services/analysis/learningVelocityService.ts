import { LearningVelocity } from '@prisma/client'

import type { DerivedAnalysisSignals, LearningVelocityResult } from './analysisTypes'
import { clampScore, scaleToRange } from './analysisUtils'
import type { FusedAnalysisSignals } from './fusion/fusionTypes'

const RECENT_WINDOW_DAYS = 180
const PRIOR_WINDOW_DAYS = 360

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

export function calculateLearningVelocity(
  signals: DerivedAnalysisSignals,
  fusion: FusedAnalysisSignals,
): LearningVelocityResult {
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

  const score = clampScore(
    10 +
      scaleToRange(signals.recentLanguageAdoptions.length, 4, 20) +
      scaleToRange(recentRepositoryCreations, 4, 14) +
      scaleToRange(Math.max(commitGrowth, 0), 1.5, 14) +
      scaleToRange(Math.max(activeWeekGrowth, 0), 1.5, 10) +
      scaleToRange(fusion.growthMomentum.score, 100, 28),
    8,
    96,
  )

  let label: LearningVelocity = LearningVelocity.LOW

  if (score >= 78) {
    label = LearningVelocity.ACCELERATING
  } else if (score >= 58) {
    label = LearningVelocity.HIGH
  } else if (score >= 35) {
    label = LearningVelocity.MODERATE
  }

  const supportingSignals = [
    signals.recentLanguageAdoptions.length > 0
      ? `${signals.recentLanguageAdoptions.length} languages or stack signals appeared for the first time in the last six months.`
      : 'No clear new language adoption was detected in the recent window.',
    recentRepositoryCreations > 0
      ? `${recentRepositoryCreations} repositories were created in the last six months compared with ${priorRepositoryCreations} in the prior window.`
      : 'Recent project creation signals are limited.',
    fusion.growthMomentum.explanation[0] ??
      'Recent growth momentum is still inferred conservatively from the currently synced metadata.',
    signals.recentActiveWeeks > 0
      ? `${signals.recentActiveWeeks} active weeks were observed in the latest 12-week window.`
      : 'Recent activity consistency is still limited.',
  ]

  const explanation =
    label === LearningVelocity.ACCELERATING
      ? 'Recent project activity and linked practice-platform momentum both point to a fast-moving growth phase.'
      : label === LearningVelocity.HIGH
        ? 'Recent repository signals plus external practice trends show meaningful learning momentum.'
        : label === LearningVelocity.MODERATE
          ? 'There is visible recent movement, but growth signals are steady rather than sharply accelerating.'
          : 'Recent expansion signals are limited, so learning velocity is scored conservatively.'

  return {
    label,
    score,
    explanation,
    supportingSignals,
    sourceContributions: fusion.growthMomentum.contributions,
  }
}
