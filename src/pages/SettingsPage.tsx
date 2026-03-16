import { AlertTriangle, Download, LogOut, MessageSquareMore, RefreshCw } from 'lucide-react'

import { PageHeader } from '@/components/ui/PageHeader'
import { SettingsPanel } from '@/components/ui/SettingsPanel'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import {
  settingsAccentPalette,
  settingsAccounts,
  settingsNotifications,
  settingsPrivacyControls,
  settingsProfile,
  settingsThemeOptions,
} from '@/data/settings'

const buttonClass =
  'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06]'

const inputClass =
  'h-12 w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm text-white outline-none'

export function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        badge="Secure workspace"
        badgeTone="cyan"
        description="Manage connected accounts, preferences, alerts, and privacy controls without implying any source-code storage."
        eyebrow="Settings"
        title="Settings"
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <SettingsPanel
          subtitle="Integrations that feed the Developer Genome."
          title="Connected accounts"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {settingsAccounts.map((account) => {
              const Icon = account.icon

              return (
                <article
                  key={account.name}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                      <Icon className="h-5 w-5 text-cyan" />
                    </div>
                    <StatusBadge
                      label={account.status === 'connected' ? 'Connected' : 'Coming soon'}
                      tone={account.status === 'connected' ? 'cyan' : account.accent}
                    />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">
                    {account.name}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-ink-muted">
                    {account.description}
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-ink-soft">
                    {account.detail}
                  </p>
                  <button className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]" type="button">
                    {account.action}
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
              <p className="mt-3 font-display text-3xl font-bold text-white">Active</p>
              <p className="mt-2 text-sm text-ink-muted">GitHub connected · Last sync 2 hours ago</p>
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
        <SettingsPanel subtitle="Static profile fields for the prototype." title="Profile settings">
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">Display name</span>
              <input className={inputClass} defaultValue={settingsProfile.displayName} type="text" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">Username</span>
              <input className={inputClass} defaultValue={settingsProfile.username} type="text" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">Role goal</span>
              <input className={inputClass} defaultValue={settingsProfile.role} type="text" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">Timezone</span>
              <input className={inputClass} defaultValue={settingsProfile.timezone} type="text" />
            </label>
            <button className="inline-flex w-fit items-center justify-center rounded-full bg-violet px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-soft" type="button">
              Update profile
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel subtitle="Theme and dashboard personalization." title="Theme preferences">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {settingsThemeOptions.map((option) => {
                const Icon = option.icon

                return (
                  <button
                    key={option.label}
                    className={`rounded-3xl border p-5 text-left transition ${
                      option.selected
                        ? 'border-violet/25 bg-violet/10 shadow-glow'
                        : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]'
                    }`}
                    type="button"
                  >
                    <Icon className="h-5 w-5 text-white" />
                    <p className="mt-4 font-display text-xl font-bold text-white">{option.label}</p>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">{option.description}</p>
                  </button>
                )
              })}
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Accent color</p>
              <div className="flex gap-3">
                {settingsAccentPalette.map((color) => (
                  <span
                    key={color}
                    className="h-9 w-9 rounded-full border border-white/10"
                    style={{ backgroundColor: color }}
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
                <ToggleSwitch checked={false} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-white">Genome score heatmap</p>
                  <p className="text-xs text-ink-soft">Highlight hot zones in visualizations.</p>
                </div>
                <ToggleSwitch checked />
              </div>
            </div>
          </div>
        </SettingsPanel>
      </div>

      <SettingsPanel subtitle="What updates should surface in the workspace." title="Intelligent notifications">
        <div className="grid gap-4 md:grid-cols-2">
          {settingsNotifications.map((notification) => (
            <div
              key={notification.label}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
            >
              <div>
                <p className="text-sm font-semibold text-white">{notification.label}</p>
                <p className="mt-1 text-xs leading-6 text-ink-soft">{notification.description}</p>
              </div>
              <ToggleSwitch checked={notification.enabled} />
            </div>
          ))}
        </div>
      </SettingsPanel>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SettingsPanel subtitle="Clarity-first privacy wording for the frontend prototype." title="Privacy & data controls">
          <div className="space-y-4">
            {settingsPrivacyControls.map((control) => {
              const Icon = control.icon

              return (
                <article
                  key={control.label}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                      <Icon className="h-5 w-5 text-cyan" />
                    </div>
                    <StatusBadge label={control.value} tone="cyan" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">
                    {control.label}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">
                    {control.description}
                  </p>
                </article>
              )
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className={buttonClass} type="button">
              <Download className="mr-2 h-4 w-4" />
              Export data
            </button>
            <button className={buttonClass} type="button">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh account links
            </button>
          </div>
        </SettingsPanel>

        <SettingsPanel subtitle="Account-level actions for support and cleanup." title="Account">
          <div className="space-y-3">
            <button className={`${buttonClass} w-full`} type="button">
              <MessageSquareMore className="mr-2 h-4 w-4" />
              Contact support
            </button>
            <button className={`${buttonClass} w-full`} type="button">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset preferences
            </button>
            <button className={`${buttonClass} w-full`} type="button">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
            <button className="inline-flex w-full items-center justify-center rounded-full border border-red/20 bg-red/10 px-4 py-2 text-sm font-semibold text-red transition hover:bg-red/20" type="button">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Delete account
            </button>
          </div>
        </SettingsPanel>
      </div>
    </div>
  )
}
