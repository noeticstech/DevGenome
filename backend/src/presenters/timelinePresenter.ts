import type { LearningVelocity, TimelineEventType } from '@prisma/client'

import type { DerivedAnalysisSignals } from '../services/analysis'
import type {
  LatestGenomeProfileRecord,
  LatestSkillGapReportRecord,
  ProductUserState,
  TechnologyJourneyRecord,
  TimelineMetricRecord,
  TimelineEventRecord,
} from '../services/product/productDataService'
import { presentLearningVelocityLabel, presentProductMeta } from './productMetaPresenter'
import type { TimelineResponse } from '../types/api/product'

function getGrowthStage(input: {
  userState: ProductUserState
  genomeProfile: LatestGenomeProfileRecord | null
  learningVelocity: LearningVelocity | null
}) {
  if (!input.userState.hasSyncedData) {
    return 'Awaiting synced GitHub history'
  }

  if (!input.genomeProfile) {
    return 'Profile formation stage'
  }

  if (
    input.genomeProfile.overallScore >= 80 ||
    input.learningVelocity === 'ACCELERATING'
  ) {
    return 'Scaling into advanced engineering depth'
  }

  if (
    input.genomeProfile.overallScore >= 64 ||
    input.learningVelocity === 'HIGH'
  ) {
    return 'Establishing a clear technical identity'
  }

  if (input.genomeProfile.overallScore >= 45) {
    return 'Expanding the stack with visible momentum'
  }

  return 'Building core foundations'
}

function getIconHint(eventType: TimelineEventType) {
  const iconHints: Record<TimelineEventType, string> = {
    REPOSITORY_MILESTONE: 'folder-git',
    CONTRIBUTION_MILESTONE: 'activity',
    STACK_ADOPTION: 'layers-3',
    SKILL_MILESTONE: 'sparkles',
    ROLE_EVOLUTION: 'rocket',
    ANALYSIS_MILESTONE: 'dna',
  }

  return iconHints[eventType]
}

function buildMilestoneHighlights(events: TimelineEventRecord[]) {
  const priority: Record<TimelineEventType, number> = {
    ROLE_EVOLUTION: 6,
    ANALYSIS_MILESTONE: 5,
    CONTRIBUTION_MILESTONE: 4,
    STACK_ADOPTION: 3,
    SKILL_MILESTONE: 3,
    REPOSITORY_MILESTONE: 2,
  }

  return [...events]
    .sort((left, right) => {
      const priorityDelta = priority[right.eventType] - priority[left.eventType]

      if (priorityDelta !== 0) {
        return priorityDelta
      }

      return right.eventDate.getTime() - left.eventDate.getTime()
    })
    .slice(0, 3)
    .sort((left, right) => left.eventDate.getTime() - right.eventDate.getTime())
    .map((event) => ({
      title: event.title,
      description: event.description ?? '',
      eventDate: event.eventDate.toISOString(),
      eventType: event.eventType,
    }))
}

function buildNextEvolution(input: {
  userState: ProductUserState
  preferredSkillGapReport: LatestSkillGapReportRecord | null
  strongestTechnologies: string[]
  learningVelocityLabel: string | null
}) {
  if (input.preferredSkillGapReport) {
    return {
      title: `Grow toward ${input.preferredSkillGapReport.targetRole}`,
      description:
        input.preferredSkillGapReport.learningSuggestions[0] ??
        input.preferredSkillGapReport.summary ??
        `The next evolution move is to deepen the gaps that currently limit ${input.preferredSkillGapReport.targetRole} readiness.`,
      focusAreas: input.preferredSkillGapReport.missingSkills.slice(0, 3),
    }
  }

  if (input.userState.state === 'needs_analysis') {
    return {
      title: 'Run analysis to unlock the next evolution path',
      description:
        'Synced developer metadata is ready, but the role-fit and growth recommendations have not been generated yet.',
      focusAreas: [],
    }
  }

  if (input.strongestTechnologies.length > 0) {
    return {
      title: 'Turn current strengths into a signature project',
      description: `The strongest visible stack signals currently center on ${input.strongestTechnologies.join(', ')}. A deeper project in that direction would create a clearer next-stage identity.`,
      focusAreas: input.strongestTechnologies.slice(0, 3),
    }
  }

  return {
    title:
      input.learningVelocityLabel !== null
        ? `Maintain ${input.learningVelocityLabel.toLowerCase()} learning velocity`
        : null,
    description:
      input.learningVelocityLabel !== null
        ? 'Keep expanding the visible project mix and recent activity cadence so the next round of analysis has stronger growth evidence.'
        : null,
    focusAreas: [],
  }
}

function getYearsTracked(input: {
  signals: DerivedAnalysisSignals | null
  events: TimelineEventRecord[]
}) {
  const startDates = [
    input.signals?.firstRepositoryAt ?? null,
    input.events[0]?.eventDate ?? null,
  ].filter((date): date is Date => Boolean(date))

  const endDates = [
    input.signals?.latestActivityAt ?? null,
    input.signals?.latestRepositoryAt ?? null,
    input.events.at(-1)?.eventDate ?? null,
  ].filter((date): date is Date => Boolean(date))

  if (startDates.length === 0 || endDates.length === 0) {
    return 0
  }

  const startYear = Math.min(...startDates.map((date) => date.getUTCFullYear()))
  const endYear = Math.max(...endDates.map((date) => date.getUTCFullYear()))

  return endYear - startYear + 1
}

export function presentTimeline(input: {
  userState: ProductUserState
  genomeProfile: LatestGenomeProfileRecord | null
  preferredSkillGapReport: LatestSkillGapReportRecord | null
  timelineEvents: TimelineEventRecord[]
  technologyJourney: TechnologyJourneyRecord[]
  growthMetrics: {
    repositoryGrowth: TimelineMetricRecord[]
    activityGrowth: TimelineMetricRecord[]
    technologyBreadth: TimelineMetricRecord[]
  }
  signals: DerivedAnalysisSignals | null
}): TimelineResponse {
  const learningVelocityLabel = presentLearningVelocityLabel(
    input.genomeProfile?.learningVelocity ?? null,
  )

  return {
    meta: presentProductMeta(input.userState),
    summary: {
      growthStage: getGrowthStage({
        userState: input.userState,
        genomeProfile: input.genomeProfile,
        learningVelocity: input.genomeProfile?.learningVelocity ?? null,
      }),
      yearsTracked: getYearsTracked({
        signals: input.signals,
        events: input.timelineEvents,
      }),
      milestonesCount: input.timelineEvents.length,
      stackExpansionCount: input.signals?.languageAdoptions.length ?? 0,
    },
    events: input.timelineEvents.map((event) => ({
      title: event.title,
      description: event.description ?? '',
      eventDate: event.eventDate.toISOString(),
      eventType: event.eventType,
      iconHint: getIconHint(event.eventType),
    })),
    technologyJourney: input.technologyJourney,
    growthMetrics: input.growthMetrics,
    milestoneHighlights: buildMilestoneHighlights(input.timelineEvents),
    nextEvolution: buildNextEvolution({
      userState: input.userState,
      preferredSkillGapReport: input.preferredSkillGapReport,
      strongestTechnologies: input.signals?.dominantLanguages.slice(0, 3) ?? [],
      learningVelocityLabel,
    }),
  }
}
