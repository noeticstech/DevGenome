import { DashboardLayout } from '@prisma/client'

import { env } from '../config/env'
import type {
  DeleteAccountResponse,
  DeleteSettingsHistoryResponse,
  DisconnectGithubResponse,
  SettingsResponse,
  SettingsConnectionStatus,
} from '../types/api/settings'
import type { ProductUserState } from '../services/product/productDataService'
import type {
  GithubDisconnectResult,
  HistoryDeletionResult,
  SettingsCodeforcesAccountRecord,
  SettingsLeetcodeAccountRecord,
  SettingsSnapshot,
} from '../services/settings/settingsTypes'

function buildPublicProfileSharePath(token: string | null) {
  if (!token) {
    return null
  }

  return `${env.API_PREFIX}/public/profile/${token}`
}

function presentComingSoonConnection(input: {
  provider: 'geeksforgeeks'
  label: string
}): SettingsResponse['connectedAccounts']['items'][number] {
  return {
    provider: input.provider,
    label: input.label,
    status: 'coming_soon',
    supported: false,
    username: null,
    avatarUrl: null,
    profileUrl: null,
    lastSyncedAt: null,
    message: `${input.label} support is planned for a later release.`,
    canConnect: false,
    canDisconnect: false,
  }
}

function presentGithubConnection(
  snapshot: SettingsSnapshot,
): SettingsResponse['connectedAccounts']['items'][number] {
  const githubStatus: SettingsConnectionStatus =
    snapshot.githubAccount === null
      ? 'disconnected'
      : snapshot.githubAccount.disconnectedAt === null
        ? 'connected'
        : 'disconnected'

  return {
    provider: 'github',
    label: 'GitHub',
    status: githubStatus,
    supported: true,
    username: snapshot.githubAccount?.username ?? null,
    avatarUrl: snapshot.githubAccount?.avatarUrl ?? snapshot.avatarUrl,
    profileUrl: snapshot.githubAccount?.profileUrl ?? null,
    lastSyncedAt: snapshot.githubAccount?.lastSyncedAt?.toISOString() ?? null,
    message:
      githubStatus === 'connected'
        ? 'GitHub is connected and ready for repository metadata sync.'
        : snapshot.githubAccount
          ? 'GitHub is disconnected. Historical DevGenome data remains until you delete history.'
          : 'Connect GitHub to sync repository metadata and generate your DevGenome profile.',
    canConnect: githubStatus !== 'connected',
    canDisconnect: githubStatus === 'connected',
  }
}

function presentLeetcodeConnection(
  account: SettingsLeetcodeAccountRecord | null,
): SettingsResponse['connectedAccounts']['items'][number] {
  const status: SettingsConnectionStatus =
    account === null ? 'disconnected' : account.disconnectedAt === null ? 'connected' : 'disconnected'

  return {
    provider: 'leetcode',
    label: 'LeetCode',
    status,
    supported: true,
    username: account?.username ?? null,
    avatarUrl: account?.avatarUrl ?? null,
    profileUrl: account?.profileUrl ?? null,
    lastSyncedAt: account?.lastSyncedAt?.toISOString() ?? null,
    message:
      status === 'connected'
        ? account?.lastSyncedAt
          ? 'LeetCode is linked and recent problem-solving stats are available for analysis.'
          : 'LeetCode is linked. Run a sync to pull solved counts, topic coverage, and practice signals.'
        : account
          ? 'LeetCode is unlinked. Link a handle again to resume problem-solving sync.'
          : 'Link a LeetCode handle to strengthen algorithm, interview-readiness, and problem-solving signals.',
    canConnect: status !== 'connected',
    canDisconnect: false,
  }
}

function presentCodeforcesConnection(
  account: SettingsCodeforcesAccountRecord | null,
): SettingsResponse['connectedAccounts']['items'][number] {
  const status: SettingsConnectionStatus =
    account === null
      ? 'disconnected'
      : account.disconnectedAt === null
        ? 'connected'
        : 'disconnected'

  return {
    provider: 'codeforces',
    label: 'Codeforces',
    status,
    supported: true,
    username: account?.username ?? null,
    avatarUrl: account?.avatarUrl ?? null,
    profileUrl: account?.profileUrl ?? null,
    lastSyncedAt: account?.lastSyncedAt?.toISOString() ?? null,
    message:
      status === 'connected'
        ? account?.lastSyncedAt
          ? 'Codeforces is linked and recent competitive-programming data is available for analysis.'
          : 'Codeforces is linked. Run a sync to pull ratings, contests, and tag exposure.'
        : account
          ? 'Codeforces is unlinked. Link a handle again to resume competitive-programming sync.'
          : 'Link a Codeforces handle to strengthen advanced problem-solving, contest, and rating-trend signals.',
    canConnect: status !== 'connected',
    canDisconnect: false,
  }
}

export function presentSettings(input: {
  snapshot: SettingsSnapshot
  userState: ProductUserState
}): SettingsResponse {
  return {
    connectedAccounts: {
      items: [
        presentGithubConnection(input.snapshot),
        presentLeetcodeConnection(input.snapshot.leetcodeAccount),
        presentCodeforcesConnection(input.snapshot.codeforcesAccount),
        presentComingSoonConnection({
          provider: 'geeksforgeeks',
          label: 'GeeksforGeeks',
        }),
      ],
    },
    profile: {
      displayName: input.snapshot.displayName,
      username: input.snapshot.username,
      avatarUrl: input.snapshot.avatarUrl,
      targetRole: input.snapshot.targetRole,
    },
    appearance: {
      theme: input.snapshot.theme,
      accentColor: input.snapshot.accentColor,
      dashboardLayout: input.snapshot.dashboardLayout,
      compactDashboardEnabled:
        input.snapshot.compactDashboardEnabled ||
        input.snapshot.dashboardLayout === DashboardLayout.COMPACT,
      genomeScoreHeatmapEnabled: input.snapshot.genomeScoreHeatmapEnabled,
    },
    notifications: {
      weeklySummaryEnabled: input.snapshot.weeklySummaryEnabled,
      learningProgressEnabled: input.snapshot.learningProgressEnabled,
      skillGapAlertsEnabled: input.snapshot.skillGapAlertsEnabled,
      productUpdatesEnabled: input.snapshot.productUpdatesEnabled,
    },
    privacy: {
      profileVisibility: input.snapshot.profileVisibility,
      sharing: {
        publicProfileEnabled:
          input.snapshot.profileVisibility === 'PUBLIC' &&
          input.snapshot.profileShareToken !== null,
        sharePath:
          input.snapshot.profileVisibility === 'PUBLIC'
            ? buildPublicProfileSharePath(input.snapshot.profileShareToken)
            : null,
        revocationStrategy: 'disable_public_profile',
        message:
          input.snapshot.profileVisibility === 'PUBLIC'
            ? 'Your public DevGenome profile is enabled. Switch visibility away from Public to revoke the current share link.'
            : 'Public sharing is disabled. Set profile visibility to Public to create a revocable share link.',
      },
      metadataOnlyAnalysis: input.snapshot.metadataOnlyAnalysis,
      sourceCodeStorage: {
        status: 'disabled',
        message:
          'Source code storage is disabled. DevGenome uses repository metadata and activity summaries only.',
      },
    },
    account: {
      state: input.userState.state,
      accountCreatedAt: input.snapshot.createdAt.toISOString(),
      lastSyncAt: input.snapshot.lastSyncAt?.toISOString() ?? null,
      lastAnalysisAt: input.userState.lastAnalysisAt?.toISOString() ?? null,
      connectedProviderCount: input.snapshot.connectedProviderCount,
      repositoryCount: input.userState.repositoryCount,
      languageCount: input.userState.languageCount,
    },
  }
}

export function presentDisconnectGithubResult(
  result: GithubDisconnectResult,
): DisconnectGithubResponse {
  return {
    success: true,
    status: result.status,
    disconnectedProvider: 'github',
    sessionCleared: true,
    retainedDataSummary: {
      historyRetained: true,
      repositoryCount: result.repositoryCount,
      analysisRecords: result.analysisRecords,
    },
    message:
      result.status === 'disconnected'
        ? 'GitHub was disconnected. Historical DevGenome data is still available until you delete history.'
        : 'GitHub is already disconnected. Historical DevGenome data remains available until you delete history.',
    nextStep:
      'Reconnect GitHub to resume syncing, or delete history if you want to remove stored repository metadata and analysis outputs.',
  }
}

export function presentDeleteHistoryResult(
  result: HistoryDeletionResult,
): DeleteSettingsHistoryResponse {
  return {
    success: true,
    status: result.status,
    message:
      result.status === 'history_deleted'
        ? 'Stored repository metadata and generated analysis history were deleted.'
        : 'There was no stored repository metadata or generated analysis history to delete.',
    deletedCounts: result.deletedCounts,
  }
}

export function presentDeleteAccountResult(): DeleteAccountResponse {
  return {
    success: true,
    status: 'account_deleted',
    sessionCleared: true,
    message: 'Your DevGenome account and associated data were deleted.',
  }
}
