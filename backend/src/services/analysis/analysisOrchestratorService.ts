import { Prisma } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import { logger } from '../../lib/logger'
import { invalidateUserRuntimeCache } from '../cache'
import type { DevGenomeAnalysisResult } from './analysisTypes'
import { getAnalysisContextForUser } from './analysisContextService'
import { classifyDeveloperArchetype } from './developerTypeService'
import { buildFusedAnalysisSignals, getInterviewReadinessLabel, getTopContributingSources } from './fusion'
import { calculateGenomeScore } from './genomeScoreService'
import { calculateLearningVelocity } from './learningVelocityService'
import { deriveAnalysisSignals } from './signalExtractionService'
import { calculateSkillGapReports } from './skillGapService'
import { calculateSkillScores } from './skillScoringService'
import { generateTimelineEvents } from './timelineGenerationService'

function buildWarnings(result: {
  repositoryCount: number
  totalCommitCount: number
  languageBreadth: number
  leetcodeTotalSolved: number
  codeforcesTotalSolvedProblems: number
}) {
  const warnings: string[] = []

  if (result.repositoryCount === 0) {
    warnings.push(
      result.leetcodeTotalSolved > 0
        ? 'GitHub repository metadata is still limited, so project-depth signals remain conservative even though external problem-solving data is available.'
        : result.codeforcesTotalSolvedProblems > 0
          ? 'GitHub repository metadata is still limited, so project-depth signals remain conservative even though external problem-solving data is available.'
        : 'No synced repositories were available, so analysis outputs were generated from minimal metadata and kept intentionally conservative.',
    )
  }

  if (result.totalCommitCount === 0) {
    warnings.push(
      'Commit activity data is limited, so consistency and learning-velocity signals were inferred conservatively.',
    )
  }

  if (result.languageBreadth <= 1) {
    warnings.push(
      'Language breadth is narrow in the current synced dataset, so stack-diversity and exploration signals remain modest.',
    )
  }

  return warnings
}

export async function generateAndPersistUserAnalysis(
  userId: string,
): Promise<DevGenomeAnalysisResult> {
  logger.info('DevGenome analysis started', { userId })

  const context = await getAnalysisContextForUser(userId)
  const signals = deriveAnalysisSignals(context)
  const fusion = buildFusedAnalysisSignals(signals)
  const skills = calculateSkillScores(signals, fusion)
  const learningVelocity = calculateLearningVelocity(signals, fusion)
  const developerType = classifyDeveloperArchetype(signals, skills, fusion)
  const genome = calculateGenomeScore({
    signals,
    skillScores: skills,
    developerType,
    learningVelocity,
    fusion,
  })
  const { preferredTargetRole, reports: skillGapReports } = calculateSkillGapReports({
    signals,
    skillScores: skills,
    learningVelocity,
    preferredRole: context.user.preference?.targetRole,
    fusion,
  })
  const timelineEvents = generateTimelineEvents({
    signals,
    skillScores: skills,
    developerType,
    learningVelocity,
  })
  const warnings = buildWarnings({
    repositoryCount: signals.totalRepositories,
    totalCommitCount: signals.totalCommitCount,
    languageBreadth: signals.languageBreadth,
    leetcodeTotalSolved: signals.leetcodeTotalSolved,
    codeforcesTotalSolvedProblems: signals.codeforcesTotalSolvedProblems,
  })

  await prisma.$transaction(async (tx) => {
    await tx.genomeProfile.deleteMany({
      where: { userId },
    })

    await tx.genomeProfile.create({
      data: {
        userId,
        overallScore: genome.overallScore,
        algorithmsScore: skills.scores.algorithms.score,
        backendScore: skills.scores.backend.score,
        frontendScore: skills.scores.frontend.score,
        databaseScore: skills.scores.databases.score,
        devopsScore: skills.scores.devops.score,
        systemDesignScore: skills.scores.systemDesign.score,
        securityScore: skills.scores.security.score,
        collaborationScore: skills.scores.collaboration.score,
        developerType: developerType.developerType,
        learningVelocity: learningVelocity.label,
        summary: genome.summary,
        generatedAt: signals.generatedAt,
      },
    })

    await tx.skillGapReport.deleteMany({
      where: { userId },
    })

    for (const report of skillGapReports) {
      await tx.skillGapReport.create({
        data: {
          userId,
          targetRole: report.targetRole,
          matchScore: report.readinessScore,
          summary: report.summary,
          missingSkills: report.missingSkills,
          learningSuggestions: report.recommendedLearningAreas,
          recommendedProjects: report.suggestedProjects,
          generatedAt: signals.generatedAt,
        },
      })
    }

    await tx.timelineEvent.deleteMany({
      where: { userId },
    })

    for (const event of timelineEvents) {
      await tx.timelineEvent.create({
        data: {
          userId,
          title: event.title,
          description: event.description,
          eventDate: event.eventDate,
          eventType: event.eventType,
          metadata: event.metadata
            ? (event.metadata as Prisma.InputJsonValue)
            : undefined,
        },
      })
    }
  })

  logger.info('DevGenome analysis completed', {
    userId,
    repositoryCount: signals.totalRepositories,
    skillGapReports: skillGapReports.length,
    timelineEvents: timelineEvents.length,
    warningsCount: warnings.length,
  })

  invalidateUserRuntimeCache(userId)

  return {
    userId,
    generatedAt: signals.generatedAt.toISOString(),
    genome,
    skills,
    developerType,
    learningVelocity,
    preferredTargetRole,
    skillGapReports,
    timelineEvents,
    warnings,
    fusionSummary: {
      interviewReadinessScore: fusion.interviewReadiness.score,
      interviewReadinessLabel: getInterviewReadinessLabel(fusion.interviewReadiness.score),
      interviewReadinessSources: getTopContributingSources(fusion.interviewReadiness, 3),
      problemSolvingSources: getTopContributingSources(fusion.problemSolvingStrength, 3),
      builderSources: getTopContributingSources(fusion.builderStrength, 3),
      growthSources: getTopContributingSources(fusion.growthMomentum, 3),
    },
  }
}
