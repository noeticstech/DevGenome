import { DashboardLayout, ProfileVisibility, ThemePreference } from '@prisma/client'
import { z } from 'zod'

import { AppError } from '../utils/app-error'
import type { SettingsPreferenceUpdateInput } from '../services/settings/settingsTypes'
import { getSupportedTargetRoles } from '../services/analysis'

const supportedTargetRoles = getSupportedTargetRoles()

const settingsPreferencesSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80).nullable().optional(),
    targetRole: z
      .string()
      .refine(
        (value) => supportedTargetRoles.includes(value as (typeof supportedTargetRoles)[number]),
        {
          message: 'Invalid target role',
        },
      )
      .nullable()
      .optional(),
    theme: z.nativeEnum(ThemePreference).optional(),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    dashboardLayout: z.nativeEnum(DashboardLayout).optional(),
    compactDashboardEnabled: z.boolean().optional(),
    genomeScoreHeatmapEnabled: z.boolean().optional(),
    weeklySummaryEnabled: z.boolean().optional(),
    learningProgressEnabled: z.boolean().optional(),
    skillGapAlertsEnabled: z.boolean().optional(),
    productUpdatesEnabled: z.boolean().optional(),
    profileVisibility: z.nativeEnum(ProfileVisibility).optional(),
    metadataOnlyAnalysis: z.literal(true).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one preference field must be provided',
  })

export function validateSettingsPreferenceUpdate(
  input: unknown,
): SettingsPreferenceUpdateInput {
  const parsedInput = settingsPreferencesSchema.safeParse(input)

  if (!parsedInput.success) {
    const firstIssue = parsedInput.error.issues[0]
    throw new AppError(400, firstIssue?.message ?? 'Invalid settings update payload')
  }

  return parsedInput.data
}
