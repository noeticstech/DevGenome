import { DashboardLayout } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import { invalidateUserRuntimeCache } from '../cache'
import type { SettingsPreferenceUpdateInput } from './settingsTypes'
import { getSettingsResponse } from './settingsService'

function buildPreferenceUpdateData(input: SettingsPreferenceUpdateInput) {
  const preferenceData: Record<string, unknown> = {}

  if (input.targetRole !== undefined) {
    preferenceData.targetRole = input.targetRole
  }

  if (input.theme !== undefined) {
    preferenceData.theme = input.theme
  }

  if (input.accentColor !== undefined) {
    preferenceData.accentColor = input.accentColor
  }

  if (input.dashboardLayout !== undefined) {
    preferenceData.dashboardLayout = input.dashboardLayout
  }

  if (input.compactDashboardEnabled !== undefined) {
    preferenceData.compactDashboardEnabled = input.compactDashboardEnabled
  }

  if (input.genomeScoreHeatmapEnabled !== undefined) {
    preferenceData.genomeScoreHeatmapEnabled = input.genomeScoreHeatmapEnabled
  }

  if (input.weeklySummaryEnabled !== undefined) {
    preferenceData.weeklySummaryEnabled = input.weeklySummaryEnabled
  }

  if (input.learningProgressEnabled !== undefined) {
    preferenceData.learningProgressEnabled = input.learningProgressEnabled
  }

  if (input.skillGapAlertsEnabled !== undefined) {
    preferenceData.skillGapAlertsEnabled = input.skillGapAlertsEnabled
  }

  if (input.productUpdatesEnabled !== undefined) {
    preferenceData.productUpdatesEnabled = input.productUpdatesEnabled
  }

  if (input.profileVisibility !== undefined) {
    preferenceData.profileVisibility = input.profileVisibility
  }

  if (input.metadataOnlyAnalysis !== undefined) {
    preferenceData.metadataOnlyAnalysis = input.metadataOnlyAnalysis
  }

  if (
    input.dashboardLayout !== undefined &&
    input.compactDashboardEnabled === undefined
  ) {
    preferenceData.compactDashboardEnabled =
      input.dashboardLayout === DashboardLayout.COMPACT
  }

  if (
    input.compactDashboardEnabled !== undefined &&
    input.dashboardLayout === undefined
  ) {
    preferenceData.dashboardLayout = input.compactDashboardEnabled
      ? DashboardLayout.COMPACT
      : DashboardLayout.DETAILED
  }

  return preferenceData
}

export async function updateSettingsPreferences(input: {
  userId: string
  preferences: SettingsPreferenceUpdateInput
}) {
  const preferenceUpdateData = buildPreferenceUpdateData(input.preferences)

  await prisma.$transaction(async (tx) => {
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
