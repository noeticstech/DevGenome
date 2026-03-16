import { ProfileVisibility } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import { AppError } from '../../utils/app-error'
import { getDashboardResponse } from '../product/dashboardService'
import { getGenomeResponse } from '../product/genomeService'
import { getTimelineResponse } from '../product/timelineService'
import type { PublicProfileResponse } from '../../types/api/sharing'

export async function getPublicProfileResponse(
  shareToken: string,
): Promise<PublicProfileResponse> {
  const preference = await prisma.userPreference.findUnique({
    where: {
      profileShareToken: shareToken,
    },
    select: {
      profileVisibility: true,
      metadataOnlyAnalysis: true,
      updatedAt: true,
      targetRole: true,
      user: {
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
  })

  if (!preference || preference.profileVisibility !== ProfileVisibility.PUBLIC) {
    throw new AppError(404, 'Shared profile not found', {
      category: 'not_found',
      code: 'SHARED_PROFILE_NOT_FOUND',
      exposeMessage: false,
    })
  }

  const [dashboard, genome, timeline] = await Promise.all([
    getDashboardResponse(preference.user.id),
    getGenomeResponse(preference.user.id),
    getTimelineResponse(preference.user.id),
  ])

  return {
    meta: {
      visibility: 'public',
      shared: true,
      metadataOnlyAnalysis: preference.metadataOnlyAnalysis,
      sourceCodeStorage: 'disabled',
      sharedAt: preference.updatedAt.toISOString(),
    },
    profile: {
      displayName: preference.user.displayName,
      username: preference.user.username,
      avatarUrl: preference.user.avatarUrl,
      bio: preference.user.bio,
      targetRole: preference.targetRole,
    },
    overview: {
      genomeScore: genome.summary.genomeScore,
      statusLabel: genome.summary.statusLabel,
      archetypeLabel: genome.archetype.label,
      summary: genome.summary.subtitle,
      learningVelocity: dashboard.overview.learningVelocity.label,
    },
    highlights: dashboard.highlights.slice(0, 4),
    skills: {
      items: genome.skillBreakdown.items,
      strongest: genome.skillBreakdown.strongest,
      growthAreas: genome.skillBreakdown.weakest,
    },
    languages: {
      items: dashboard.languageDistribution.items.slice(0, 8),
    },
    careerFit: {
      primaryRole: genome.careerFit.primary?.targetRole ?? preference.targetRole,
      readinessScore: genome.careerFit.primary?.readinessScore ?? null,
      summary: genome.careerFit.primary?.summary ?? null,
      growthFocus: genome.careerFit.growthFocus,
    },
    timeline: {
      highlights: timeline.milestoneHighlights.slice(0, 5),
      nextEvolution: timeline.nextEvolution,
    },
  }
}
