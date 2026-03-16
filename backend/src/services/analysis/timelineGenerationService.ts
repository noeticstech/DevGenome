import { TimelineEventType } from '@prisma/client'

import type {
  DeveloperArchetypeResult,
  DerivedAnalysisSignals,
  GeneratedTimelineEvent,
  LearningVelocityResult,
  SkillScoringResult,
} from './analysisTypes'

function createEventKey(event: GeneratedTimelineEvent) {
  return `${event.title}|${event.eventDate.toISOString().slice(0, 10)}`
}

function pushEvent(target: GeneratedTimelineEvent[], event: GeneratedTimelineEvent | null) {
  if (!event) {
    return
  }

  const key = createEventKey(event)

  if (target.some((existingEvent) => createEventKey(existingEvent) === key)) {
    return
  }

  target.push(event)
}

export function generateTimelineEvents(input: {
  signals: DerivedAnalysisSignals
  skillScores: SkillScoringResult
  developerType: DeveloperArchetypeResult
  learningVelocity: LearningVelocityResult
}): GeneratedTimelineEvent[] {
  const events: GeneratedTimelineEvent[] = []

  const firstRepository = input.signals.repositories
    .filter((repository) => repository.createdAt)
    .sort((left, right) => left.createdAt!.getTime() - right.createdAt!.getTime())[0]

  pushEvent(
    events,
    firstRepository?.createdAt
      ? {
          title: 'Published the first tracked repository',
          description: `${firstRepository.fullName} marks the first repository milestone visible in synced metadata.`,
          eventDate: firstRepository.createdAt,
          eventType: TimelineEventType.REPOSITORY_MILESTONE,
          metadata: {
            repositoryFullName: firstRepository.fullName,
          },
        }
      : null,
  )

  const dominantLanguage = input.signals.dominantLanguages[0]
  const dominantLanguageAdoption = dominantLanguage
    ? input.signals.languageAdoptions.find(
        (language) => language.languageName === dominantLanguage.toLowerCase(),
      ) ?? input.signals.languageAdoptions.find(
        (language) => language.languageName.toLowerCase() === dominantLanguage.toLowerCase(),
      )
    : null

  pushEvent(
    events,
    dominantLanguageAdoption
      ? {
          title: `Adopted ${dominantLanguageAdoption.languageName} as a core language`,
          description: `${dominantLanguageAdoption.languageName} became part of the visible stack through ${dominantLanguageAdoption.repositoryFullName}.`,
          eventDate: dominantLanguageAdoption.firstSeenAt,
          eventType: TimelineEventType.STACK_ADOPTION,
          metadata: {
            languageName: dominantLanguageAdoption.languageName,
            repositoryFullName: dominantLanguageAdoption.repositoryFullName,
          },
        }
      : null,
  )

  const categoryEventDefinitions = [
    {
      category: 'frontend',
      title: 'Started building frontend experiences',
      description: 'Repository metadata began to show clear UI and product-facing implementation signals.',
      eventType: TimelineEventType.SKILL_MILESTONE,
      minimumScore: 42,
    },
    {
      category: 'backend',
      title: 'Started shipping backend systems',
      description: 'Service, API, or backend infrastructure signals appeared in synced repositories.',
      eventType: TimelineEventType.SKILL_MILESTONE,
      minimumScore: 45,
    },
    {
      category: 'databases',
      title: 'Added stronger data modeling signals',
      description: 'Database and persistence tooling started to become part of the visible stack.',
      eventType: TimelineEventType.STACK_ADOPTION,
      minimumScore: 40,
    },
    {
      category: 'devops',
      title: 'Expanded into infrastructure and delivery',
      description: 'Deployment, CI/CD, or infrastructure signals began to appear in repository metadata.',
      eventType: TimelineEventType.STACK_ADOPTION,
      minimumScore: 40,
    },
  ] as const

  for (const definition of categoryEventDefinitions) {
    const milestone = input.signals.categoryMilestones.find(
      (signal) => signal.category === definition.category,
    )

    if (!milestone) {
      continue
    }

    if (input.skillScores.scores[definition.category].score < definition.minimumScore) {
      continue
    }

    pushEvent(events, {
      title: definition.title,
      description: `${definition.description} ${milestone.repositoryFullName} is the earliest synced evidence for this shift.`,
      eventDate: milestone.firstSeenAt,
      eventType: definition.eventType,
      metadata: {
        category: definition.category,
        repositoryFullName: milestone.repositoryFullName,
      },
    })
  }

  if (input.signals.recentActiveWeeks >= 8 && input.signals.latestActivityAt) {
    pushEvent(events, {
      title: 'Built a consistent shipping rhythm',
      description: `Recent weekly activity shows sustained delivery across ${input.signals.recentActiveWeeks} active weeks in the latest analysis window.`,
      eventDate: input.signals.latestActivityAt,
      eventType: TimelineEventType.CONTRIBUTION_MILESTONE,
      metadata: {
        recentActiveWeeks: input.signals.recentActiveWeeks,
        recentCommitCount: input.signals.recentCommitCount,
      },
    })
  }

  if (
    input.learningVelocity.label === 'ACCELERATING' ||
    (input.learningVelocity.label === 'HIGH' &&
      input.signals.recentLanguageAdoptions.length >= 2)
  ) {
    const eventDate =
      input.signals.recentLanguageAdoptions.at(-1)?.firstSeenAt ??
      input.signals.latestActivityAt ??
      input.signals.latestRepositoryAt

    pushEvent(
      events,
      eventDate
        ? {
            title: 'Entered a faster learning phase',
            description: `${input.learningVelocity.explanation} Recent stack expansion and activity trends suggest noticeable growth momentum.`,
            eventDate,
            eventType: TimelineEventType.ROLE_EVOLUTION,
            metadata: {
              learningVelocity: input.learningVelocity.label,
              recentLanguageAdoptions: input.signals.recentLanguageAdoptions.length,
            },
          }
        : null,
    )
  }

  if (
    input.developerType.developerType === 'ARCHITECT' &&
    input.skillScores.scores.systemDesign.score >= 60 &&
    input.signals.latestRepositoryAt
  ) {
    pushEvent(events, {
      title: 'Shifted toward system-level engineering',
      description:
        'Recent metadata shows a stronger mix of backend, infrastructure, and architecture signals than earlier projects.',
      eventDate: input.signals.latestRepositoryAt,
      eventType: TimelineEventType.ANALYSIS_MILESTONE,
      metadata: {
        developerType: input.developerType.label,
        systemDesignScore: input.skillScores.scores.systemDesign.score,
      },
    })
  }

  return events
    .sort((left, right) => left.eventDate.getTime() - right.eventDate.getTime())
    .slice(0, 8)
}
