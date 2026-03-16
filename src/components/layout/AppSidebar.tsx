import { Binary, Github, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Logo } from '@/components/ui/Logo'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { appNavigation } from '@/data/app'
import { cn } from '@/lib/cn'
import { formatRelativeTime } from '@/lib/productPresentation'

export function AppSidebar() {
  const { user } = useAuth()
  const githubAccount = user?.connectedAccounts.find((account) => account.provider === 'GITHUB')
  const sidebarHighlights = [
    {
      label: 'Source code storage',
      value: 'Disabled',
      icon: Binary,
    },
    {
      label: 'Analysis mode',
      value: 'Metadata only',
      icon: Sparkles,
    },
    {
      label: 'GitHub',
      value: githubAccount?.lastSyncedAt
        ? `Synced ${formatRelativeTime(githubAccount.lastSyncedAt)}`
        : githubAccount
          ? 'Connected'
          : 'Not linked',
      icon: Github,
    },
  ]

  return (
    <aside className="hidden w-[292px] shrink-0 border-r border-white/6 bg-black/30 px-4 py-5 backdrop-blur-2xl lg:flex lg:flex-col">
      <Logo className="px-2" compact />
      <nav className="mt-8 space-y-2">
        {appNavigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl border px-4 py-3 transition',
                  isActive
                    ? 'border-violet/25 bg-violet/12 text-white shadow-glow'
                    : 'border-transparent text-ink-muted hover:border-white/8 hover:bg-white/[0.03] hover:text-white',
                )
              }
              to={item.path}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-2xl transition',
                      isActive ? 'bg-violet/20 text-violet-soft' : 'bg-white/[0.03]',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.label}</span>
                      {item.badge ? (
                        <StatusBadge className="hidden xl:inline-flex" label={item.badge} />
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-ink-soft">{item.description}</p>
                  </div>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
      <div className="mt-auto space-y-4 pt-8">
        <div className="surface-panel-strong p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">
            System status
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
            <p className="text-sm font-medium text-white">
              {githubAccount ? 'Workspace connected' : 'Awaiting GitHub connection'}
            </p>
          </div>
          <div className="mt-4 space-y-3">
            {sidebarHighlights.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-cyan" />
                    <span className="text-xs text-ink-muted">{item.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{item.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
