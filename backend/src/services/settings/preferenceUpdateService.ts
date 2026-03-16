import { randomBytes } from 'node:crypto'

import { DashboardLayout, ProfileVisibility } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import { invalidateUserRuntimeCache } from '../cache'
import type { SettingsPreferenceUpdateInput } from './settingsTypes'
import { getSettingsResponse } from './settingsService'

function generateProfileShareToken() {
  return randomBytes(18).toString('base64url')
}

function buildPreferenceUpdateData(input: {
  preferences: SettingsPreferenceUpdateInput
  currentPreference: {
    profileVisibility: ProfileVisibility
    profileShareToken: string | null
  } | null
}) {
  const preferenceData: Record<string, unknown> = {}
  const currentPreference = input.currentPreference
  const preferences = input.preferences

  if (preferences.targetRole !== undefined) {
    preferenceData.targetRole = preferences.targetRole
  }

  if (preferences.theme !== undefined) {
    preferenceData.theme = preferences.theme
  }

  if (preferences.accentColor !== undefined) {
    preferenceData.accentColor = preferences.accentColor
  }

  if (preferences.dashboardLayout !== undefined) {
    preferenceData.dashboardLayout = preferences.dashboardLayout
  }

  if (preferences.compactDashboardEnabled !== undefined) {
    preferenceData.compactDashboardEnabled = preferences.compactDashboardEnabled
  }

  if (preferences.genomeScoreHeatmapEnabled !== undefined) {
    preferenceData.genomeScoreHeatmapEnabled = preferences.genomeScoreHeatmapEnabled
  }

  if (preferences.weeklySummaryEnabled !== undefined) {
    preferenceData.weeklySummaryEnabled = preferences.weeklySummaryEnabled
  }

  if (preferences.learningProgressEnabled !== undefined) {
    preferenceData.learningProgressEnabled = preferences.learningProgressEnabled
  }

  if (preferences.skillGapAlertsEnabled !== undefined) {
    preferenceData.skillGapAlertsEnabled = preferences.skillGapAlertsEnabled
  }

  if (preferences.productUpdatesEnabled !== undefined) {
    preferenceData.productUpdatesEnabled = preferences.productUpdatesEnabled
  }

  if (preferences.profileVisibility !== undefined) {
    preferenceData.profileVisibility = preferences.profileVisibility

    if (preferences.profileVisibility === ProfileVisibility.PUBLIC) {
      preferenceData.profileShareToken =
        currentPreference?.profileShareToken ?? generateProfileShareToken()
    } else {
      preferenceData.profileShareToken = null
    }
  }

  if (preferences.metadataOnlyAnalysis !== undefined) {
    preferenceData.metadataOnlyAnalysis = preferences.metadataOnlyAnalysis
  }

  if (
    preferences.dashboardLayout !== undefined &&
    preferences.compactDashboardEnabled === undefined
  ) {
    preferenceData.compactDashboardEnabled =
      preferences.dashboardLayout === DashboardLayout.COMPACT
  }

  if (
    preferences.compactDashboardEnabled !== undefined &&
    preferences.dashboardLayout === undefined
  ) {
    preferenceData.dashboardLayout = preferences.compactDashboardEnabled
      ? DashboardLayout.COMPACT
      : DashboardLayout.DETAILED
  }

  return preferenceData
}

export async function updateSettingsPreferences(input: {
  userId: string
  preferences: SettingsPreferenceUpdateInput
}) {
  await prisma.$transaction(async (tx) => {
    const currentPreference = await tx.userPreference.findUnique({
      where: {
        userId: input.userId,
      },
      select: {
        profileVisibility: true,
        profileShareToken: true,
      },
    })

    const preferenceUpdateData = buildPreferenceUpdateData({
      preferences: input.preferences,
      currentPreference,
    })

    if (input.preferences.displayName !== undefined) {
      await tx.user.update({
        where: { id: input.userId },
        data: {
          displayName: input.preferences.displayName,
        },
      })
    }

    if (Object.keys(preferenceUpdateData).length > 0) {
      await tx.userPreference.upsert({
        where: {
          userId: input.userId,
        },
        update: preferenceUpdateData,
        create: {
          userId: input.userId,
          ...preferenceUpdateData,
        },
      })
    }
  })

  invalidateUserRuntimeCache(input.userId)

  return getSettingsResponse(input.userId)
}
