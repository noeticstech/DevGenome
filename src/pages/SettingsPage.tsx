import {
  AlertTriangle,
  Code2,
  Download,
  Github,
  Laptop,
  LogOut,
  MessageSquareMore,
  MoonStar,
  RefreshCw,
  ShieldCheck,
  SunMedium,
  Trophy,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLoadingState } from '@/components/ui/PageLoadingState'
import { SettingsPanel } from '@/components/ui/SettingsPanel'
import { StateNotice } from '@/components/ui/StateNotice'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { getGithubAuthStartUrl } from '@/lib/api/auth'
import {
  deleteCurrentAccount,
  deleteSettingsHistory,
  disconnectGithubAccount,
  getSettingsData,
  updateSettingsPreferences,
} from '@/lib/api/settings'
import type {
  SettingsResponse,
  ThemePreference,
  UpdateSettingsPreferencesPayload,
} from '@/lib/api/types'
import { formatDate, formatRelativeTime } from '@/lib/productPresentation'
import { settingsAccentPalette } from '@/data/settings'

const buttonClass =
  'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70'

const inputClass =
  'h-12 w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm text-white outline-none'

const targetRoleOptions = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Software Engineer',
] as const

const themeOptions: Array<{
  value: ThemePreference
  label: string
  description: string
  icon: typeof MoonStar
}> = [
  {
    value: 'DARK',
    label: 'Dark',
    description: 'The signature DevGenome theme.',
    icon: MoonStar,
  },
  {
    value: 'SYSTEM',
    label: 'System',
    description: 'Follow your OS preference.',
    icon: Laptop,
  },
  {
    value: 'LIGHT',
    label: 'Light',
    description: 'A brighter workspace mode.',
    icon: SunMedium,
  },
]

const providerIcons = {
  github: Github,
  leetcode: Trophy,
  codeforces: Code2,
  geeksforgeeks: Code2,
}

type SettingsDraft = UpdateSettingsPreferencesPayload

export function SettingsPage() {
  const { logout, refresh: refreshAuth } = useAuth()
  const navigate = useNavigate()
  const { data, error, isLoading, refresh, setData } = useApiResource(getSettingsData)
  const [draft, setDraft] = useState<SettingsDraft | null>(null)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    tone: 'cyan' | 'violet'
    title: string
    description: string
  } | null>(null)

  useEffect(() => {
    if (data) {
      setDraft(buildDraftFromSettings(data))
    }
  }, [data])

  const hasUnsavedChanges = useMemo(() => {
    if (!data || !draft) {
      return false
    }

    return JSON.stringify(buildDraftFromSettings(data)) !== JSON.stringify(draft)
  }, [data, draft])

  const handleDraftUpdate = <Key extends keyof SettingsDraft>(
    key: Key,
    value: SettingsDraft[Key],
  ) => {
    setDraft((currentDraft) => ({
      ...(currentDraft ?? buildDraftFromSettings(data)),
      [key]: value,
    }))
  }

  const handleSave = async () => {
    if (!draft) {
      return
    }

    setActiveAction('save')

    try {
      const response = await updateSettingsPreferences(draft)
      setData(response.settings)
      await refreshAuth()
      setFeedback({
        tone: 'cyan',
        title: 'Settings saved',
        description: response.message,
      })
    } catch (caughtError) {
      setFeedback({
        tone: 'violet',
        title: 'Unable to save settings',
        description:
          caughtError instanceof Error
            ? caughtError.message
            : 'Please try again in a moment.',
      })
    } finally {
      setActiveAction(null)
    }
  }

  const handleConnectGithub = () => {
    window.location.assign(getGithubAuthStartUrl())
  }

  const handleDisconnectGithub = async () => {
    if (!window.confirm('Disconnect GitHub and clear the current session? Historical DevGenome data will remain until you delete history.')) {
      return
    }

    setActiveAction('disconnect')

    try {
      await disconnectGithubAccount()
      await refreshAuth()
      navigate('/login?notice=github_disconnected', { replace: true })
    } catch (caughtError) {
      setFeedback({
        tone: 'violet',
        title: 'Unable to disconnect GitHub',
        description:
          caughtError instanceof Error
            ? caughtError.message
            : 'Please try again in a moment.',
      })
    } finally {
      setActiveAction(null)
    }
  }

  const handleDeleteHistory = async () => {
    if (!window.confirm('Delete synced repositories, activity summaries, and generated analysis for this account? Your DevGenome account and preferences will stay intact.')) {
      return
    }

    setActiveAction('history')

    try {
      const response = await deleteSettingsHistory()
      await refresh()
      await refreshAuth()
      setFeedback({
        tone: 'cyan',
        title: 'History deleted',
        description: response.message,
      })
    } catch (caughtError) {
      setFeedback({
        tone: 'violet',
        title: 'Unable to delete history',
        description:
          caughtError instanceof Error
            ? caughtError.message
            : 'Please try again in a moment.',
      })
    } finally {
      setActiveAction(null)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your DevGenome account and all connected data? This cannot be undone.')) {
      return
    }

    setActiveAction('account')

    try {
      const response = await deleteCurrentAccount()
      setFeedback({
        tone: 'cyan',
        title: 'Account deleted',
        description: response.message,
      })
      await logout()
      navigate('/', { replace: true })
    } catch (caughtError) {
      setFeedback({
        tone: 'violet',
        title: 'Unable to delete account',
        description:
          caughtError instanceof Error
            ? caughtError.message
            : 'Please try again in a moment.',
      })
    } finally {
      setActiveAction(null)
    }
  }

  const handleSignOut = async () => {
    setActiveAction('logout')

    try {
      await logout()
      navigate('/login?notice=signed_out', { replace: true })
    } finally {
      setActiveAction(null)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <button
            className={buttonClass}
            disabled={!hasUnsavedChanges || activeAction === 'save'}
            onClick={() => void handleSave()}
            type="button"
          >
            {activeAction === 'save' ? 'Saving settings' : 'Save settings'}
          </button>
        }
        badge="Secure workspace"
        badgeTone="cyan"
        description="Manage connected accounts, preferences, alerts, and privacy controls without ever implying source-code storage."
        eyebrow="Settings"
        title="Settings"
      />

      {feedback ? (
        <StateNotice
          description={feedback.description}
          title={feedback.title}
          tone={feedback.tone}
        />
      ) : null}

      {isLoading ? <PageLoadingState /> : null}

      {!isLoading && error ? (
        <ErrorState
          action={
            <button className={buttonClass} onClick={() => void refresh()} type="button">
              Retry settings
            </button>
          }
          description={error.message}
          title="Unable to load settings"
        />
      ) : null}

      {!isLoading && !error && data && draft ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <SettingsPanel
              subtitle="Integrations that feed the live Developer Genome."
              title="Connected accounts"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.connectedAccounts.items.map((account) => {
                  const Icon = providerIcons[account.provider]
                  const isGithub = account.provider === 'github'

                  return (
                    <article
                      key={account.provider}
                      className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                          <Icon className="h-5 w-5 text-cyan" />
                        </div>
                        <StatusBadge
                          label={
                            account.status === 'connected'
                              ? 'Connected'
                              : account.status === 'coming_soon'
                                ? 'Coming soon'
                                : 'Disconnected'
                          }
                          tone={
                            account.status === 'connected'
                              ? 'cyan'
                              : account.status === 'coming_soon'
                                ? 'violet'
                                : 'blue'
                          }
                        />
                      </div>
                      <h3 className="mt-5 font-display text-xl font-bold text-white">
                        {account.label}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-ink-muted">{account.message}</p>
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-ink-soft">
                        {account.lastSyncedAt
                          ? `Last sync ${formatRelativeTime(account.lastSyncedAt)}`
                          : account.username
                            ? `@${account.username}`
                            : account.status === 'coming_soon'
                              ? 'Roadmap integration'
                              : 'Not connected'}
                      </p>
                      <button
                        className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={
                          activeAction === 'disconnect' ||
                          (!account.canConnect && !account.canDisconnect)
                        }
                        onClick={() => {
                          if (account.canDisconnect && isGithub) {
                            void handleDisconnectGithub()
                            return
                          }

                          if (account.canConnect && isGithub) {
                            handleConnectGithub()
                          }
                        }}
                        type="button"
                      >
                        {account.canDisconnect
                          ? activeAction === 'disconnect'
                            ? 'Disconnecting...'
                            : 'Disconnect GitHub'
                          : account.canConnect
                            ? 'Connect'
                            : 'Coming soon'}
                      </button>
                    </article>
                  )
                })}
              </div>
            </SettingsPanel>

            <SettingsPanel
              subtitle="Current account posture and sync state."
              title="Workspace status"
            >
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
                    Account status
                  </p>
                  <p className="mt-3 font-display text-3xl font-bold text-white">
                    {data.account.state.replace(/_/g, ' ')}
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">
                    {data.account.connectedProviderCount} connected provider
                    {data.account.connectedProviderCount === 1 ? '' : 's'} | Last sync{' '}
                    {data.account.lastSyncAt ? formatRelativeTime(data.account.lastSyncAt) : 'not yet run'}
                  </p>
                </div>
                <div className="rounded-3xl border border-cyan/20 bg-cyan/10 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan">
                    Privacy posture
                  </p>
                  <p className="mt-3 font-display text-3xl font-bold text-white">
                    Metadata-only analysis enabled
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    Repository metadata powers your profile. Source code storage remains disabled.
                  </p>
                </div>
              </div>
            </SettingsPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <SettingsPanel subtitle="Live profile fields and role preference." title="Profile settings">
              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Display name
                  </span>
                  <input
                    className={inputClass}
                    onChange={(event) => handleDraftUpdate('displayName', event.target.value)}
                    type="text"
                    value={draft.displayName ?? ''}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Username
                  </span>
                  <input
                    className={inputClass}
                    disabled
                    type="text"
                    value={data.profile.username ?? 'GitHub username will appear here'}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Target role
                  </span>
                  <select
                    className={inputClass}
                    onChange={(event) =>
                      handleDraftUpdate(
                        'targetRole',
                        event.target.value ? event.target.value : null,
                      )
                    }
                    value={draft.targetRole ?? ''}
                  >
                    <option value="">Select a target role</option>
                    {targetRoleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Profile visibility
                  </span>
                  <select
                    className={inputClass}
                    onChange={(event) =>
                      handleDraftUpdate(
                        'profileVisibility',
                        event.target.value as SettingsDraft['profileVisibility'],
                      )
                    }
                    value={draft.profileVisibility}
                  >
                    <option value="PRIVATE">Private</option>
                    <option value="TEAM">Team</option>
                    <option value="PUBLIC">Public</option>
                  </select>
                </label>
              </div>
            </SettingsPanel>

            <SettingsPanel subtitle="Theme and dashboard personalization." title="Theme preferences">
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {themeOptions.map((option) => {
                    const Icon = option.icon
                    const selected = draft.theme === option.value

                    return (
                      <button
                        key={option.value}
                        className={`rounded-3xl border p-5 text-left transition ${
                          selected
                            ? 'border-violet/25 bg-violet/10 shadow-glow'
                            : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]'
                        }`}
                        onClick={() => handleDraftUpdate('theme', option.value)}
                        type="button"
                      >
                        <Icon className="h-5 w-5 text-white" />
                        <p className="mt-4 font-display text-xl font-bold text-white">
                          {option.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-ink-muted">
                          {option.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Accent color
                  </p>
                  <div className="flex gap-3">
                    {settingsAccentPalette.map((color) => (
                      <button
                        key={color}
                        className={`h-9 w-9 rounded-full border ${
                          draft.accentColor === color
                            ? 'border-white shadow-[0_0_24px_rgba(168,85,247,0.45)]'
                            : 'border-white/10'
                        }`}
                        onClick={() => handleDraftUpdate('accentColor', color)}
                        style={{ backgroundColor: color }}
                        type="button"
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-white">Compact layout</p>
                      <p className="text-xs text-ink-soft">A denser dashboard arrangement.</p>
                    </div>
                    <ToggleSwitch
                      checked={draft.compactDashboardEnabled ?? false}
                      onChange={(value) => handleDraftUpdate('compactDashboardEnabled', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-white">Genome score heatmap</p>
                      <p className="text-xs text-ink-soft">Highlight hot zones in visualizations.</p>
                    </div>
                    <ToggleSwitch
                      checked={draft.genomeScoreHeatmapEnabled ?? true}
                      onChange={(value) => handleDraftUpdate('genomeScoreHeatmapEnabled', value)}
                    />
                  </div>
                </div>
              </div>
            </SettingsPanel>
          </div>

          <SettingsPanel subtitle="What updates should surface in the workspace." title="Intelligent notifications">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  key: 'weeklySummaryEnabled' as const,
                  label: 'Weekly summary',
                  description: 'A compact digest of your latest genome movement and role-fit changes.',
                  checked: draft.weeklySummaryEnabled ?? false,
                },
                {
                  key: 'learningProgressEnabled' as const,
                  label: 'Learning progress',
                  description: 'Milestone alerts when emerging skills become stable strengths.',
                  checked: draft.learningProgressEnabled ?? false,
                },
                {
                  key: 'skillGapAlertsEnabled' as const,
                  label: 'Skill gap alerts',
                  description: 'Notifications when target-role weak spots become more pronounced.',
                  checked: draft.skillGapAlertsEnabled ?? false,
                },
                {
                  key: 'productUpdatesEnabled' as const,
                  label: 'Product updates',
                  description: 'Release notes for new models, integrations, and visualization upgrades.',
                  checked: draft.productUpdatesEnabled ?? false,
                },
              ].map((notification) => (
                <div
                  key={notification.key}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{notification.label}</p>
                    <p className="mt-1 text-xs leading-6 text-ink-soft">
                      {notification.description}
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={notification.checked}
                    onChange={(value) => handleDraftUpdate(notification.key, value)}
                  />
                </div>
              ))}
            </div>
          </SettingsPanel>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <SettingsPanel
              subtitle="Privacy wording stays aligned with DevGenome's metadata-only product rules."
              title="Privacy & data controls"
            >
              <div className="space-y-4">
                <article className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                      <ShieldCheck className="h-5 w-5 text-cyan" />
                    </div>
                    <StatusBadge label="Disabled" tone="cyan" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">
                    Source code storage
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">
                    DevGenome does not store source code. Only repository metadata and derived analysis signals are retained.
                  </p>
                </article>
                <article className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                      <Code2 className="h-5 w-5 text-cyan" />
                    </div>
                    <StatusBadge
                      label={data.privacy.metadataOnlyAnalysis ? 'Enabled' : 'Disabled'}
                      tone="cyan"
                    />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">
                    Metadata-only analysis
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">
                    Repository metadata, contribution timing, and technology signals power your profile.
                  </p>
                </article>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className={buttonClass} type="button">
                  <Download className="mr-2 h-4 w-4" />
                  Export data
                </button>
                <button
                  className={buttonClass}
                  disabled={activeAction === 'history'}
                  onClick={() => void handleDeleteHistory()}
                  type="button"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {activeAction === 'history' ? 'Deleting history' : 'Delete history'}
                </button>
              </div>
            </SettingsPanel>

            <SettingsPanel subtitle="Account-level actions for support and cleanup." title="Account">
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-ink-muted">
                  <p className="font-semibold text-white">Account created</p>
                  <p className="mt-2">{formatDate(data.account.accountCreatedAt)}</p>
                  <p className="mt-4 font-semibold text-white">Last analysis</p>
                  <p className="mt-2">
                    {data.account.lastAnalysisAt
                      ? formatRelativeTime(data.account.lastAnalysisAt)
                      : 'Not generated yet'}
                  </p>
                </div>
                <button className={`${buttonClass} w-full`} type="button">
                  <MessageSquareMore className="mr-2 h-4 w-4" />
                  Contact support
                </button>
                <button
                  className={`${buttonClass} w-full`}
                  disabled={activeAction === 'logout'}
                  onClick={() => void handleSignOut()}
                  type="button"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {activeAction === 'logout' ? 'Signing out' : 'Sign out'}
                </button>
                <button
                  className="inline-flex w-full items-center justify-center rounded-full border border-red/20 bg-red/10 px-4 py-2 text-sm font-semibold text-red transition hover:bg-red/20 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={activeAction === 'account'}
                  onClick={() => void handleDeleteAccount()}
                  type="button"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {activeAction === 'account' ? 'Deleting account' : 'Delete account'}
                </button>
              </div>
            </SettingsPanel>
          </div>
        </>
      ) : null}
    </div>
  )
}

function buildDraftFromSettings(settings: SettingsResponse | null): SettingsDraft {
  return {
    displayName: settings?.profile.displayName ?? null,
    targetRole: settings?.profile.targetRole ?? null,
    theme: settings?.appearance.theme ?? 'SYSTEM',
    accentColor: settings?.appearance.accentColor ?? settingsAccentPalette[0],
    compactDashboardEnabled: settings?.appearance.compactDashboardEnabled ?? false,
    genomeScoreHeatmapEnabled: settings?.appearance.genomeScoreHeatmapEnabled ?? true,
    weeklySummaryEnabled: settings?.notifications.weeklySummaryEnabled ?? false,
    learningProgressEnabled: settings?.notifications.learningProgressEnabled ?? false,
    skillGapAlertsEnabled: settings?.notifications.skillGapAlertsEnabled ?? false,
    productUpdatesEnabled: settings?.notifications.productUpdatesEnabled ?? false,
    profileVisibility: settings?.privacy.profileVisibility ?? 'PRIVATE',
    metadataOnlyAnalysis: true,
  }
}
