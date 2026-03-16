import { AccountProvider, DashboardLayout, ProfileVisibility, ThemePreference } from '@prisma/client'

import { prisma } from '../../lib/prisma'
import { AppError } from '../../utils/app-error'
import { presentSettings } from '../../presenters/settingsPresenter'
import { getProductUserState } from '../product/productDataService'

export async function getSettingsResponse(userId: string) {
  const [userState, user] = await Promise.all([
    getProductUserState(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        displayName: true,
        username: true,
        avatarUrl: true,
        createdAt: true,
        preference: {
          select: {
            targetRole: true,
            theme: true,
            accentColor: true,
            dashboardLayout: true,
            compactDashboardEnabled: true,
            genomeScoreHeatmapEnabled: true,
            weeklySummaryEnabled: true,
            learningProgressEnabled: true,
            skillGapAlertsEnabled: true,
            productUpdatesEnabled: true,
            profileVisibility: true,
            metadataOnlyAnalysis: true,
            sourceCodeStorageDisabled: true,
          },
        },
        connectedAccounts: {
          where: {
            provider: {
              in: [
                AccountProvider.GITHUB,
                AccountProvider.LEETCODE,
                AccountProvider.CODEFORCES,
              ],
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          select: {
            provider: true,
            username: true,
            profileUrl: true,
            avatarUrl: true,
            lastSyncedAt: true,
            disconnectedAt: true,
          },
        },
      },
    }),
  ])

  if (!user) {
    throw new AppError(404, 'Authenticated user not found')
  }

  return presentSettings({
    userState,
    snapshot: {
      displayName: user.displayName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      targetRole: user.preference?.targetRole ?? null,
      theme: user.preference?.theme ?? ThemePreference.DARK,
      accentColor: user.preference?.accentColor ?? '#a855f7',
      dashboardLayout: user.preference?.dashboardLayout ?? DashboardLayout.DETAILED,
      compactDashboardEnabled: user.preference?.compactDashboardEnabled ?? false,
      genomeScoreHeatmapEnabled: user.preference?.genomeScoreHeatmapEnabled ?? true,
      weeklySummaryEnabled: user.preference?.weeklySummaryEnabled ?? true,
      learningProgressEnabled: user.preference?.learningProgressEnabled ?? false,
      skillGapAlertsEnabled: user.preference?.skillGapAlertsEnabled ?? true,
      productUpdatesEnabled: user.preference?.productUpdatesEnabled ?? true,
      profileVisibility: user.preference?.profileVisibility ?? ProfileVisibility.PRIVATE,
      metadataOnlyAnalysis: user.preference?.metadataOnlyAnalysis ?? true,
      sourceCodeStorageDisabled: user.preference?.sourceCodeStorageDisabled ?? true,
      githubAccount:
        user.connectedAccounts.find((account) => account.provider === AccountProvider.GITHUB) ??
        null,
      leetcodeAccount:
        user.connectedAccounts.find((account) => account.provider === AccountProvider.LEETCODE) ??
        null,
      codeforcesAccount:
        user.connectedAccounts.find(
          (account) => account.provider === AccountProvider.CODEFORCES,
        ) ?? null,
      connectedProviderCount: user.connectedAccounts.filter(
        (account) => account.disconnectedAt === null,
      ).length,
      lastSyncAt: user.connectedAccounts
        .map((account) => account.lastSyncedAt)
        .filter((date): date is Date => Boolean(date))
        .sort((left, right) => right.getTime() - left.getTime())[0] ?? null,
    },
  })
}
