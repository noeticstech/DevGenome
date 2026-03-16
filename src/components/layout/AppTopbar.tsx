import { Bell, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { appNavigation } from '@/data/app'
import { cn } from '@/lib/cn'
import {
  buildSidebarIdentity,
  formatRelativeTime,
} from '@/lib/productPresentation'
import type { RouteMeta } from '@/types'

interface AppTopbarProps {
  meta: RouteMeta
}

export function AppTopbar({ meta }: AppTopbarProps) {
  const { user } = useAuth()
  const identity = buildSidebarIdentity(user ?? {})
  const githubAccount = user?.connectedAccounts.find((account) => account.provider === 'GITHUB')
  const syncLabel = githubAccount?.lastSyncedAt
    ? `Last sync ${formatRelativeTime(githubAccount.lastSyncedAt)}`
    : identity.syncLabel

  return (
    <header className="sticky top-0 z-30 border-b border-white/6 bg-canvas/70 backdrop-blur-2xl">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex-1 space-y-4">
            <div className="relative max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
              <input
                className="h-12 w-full rounded-2xl border border-white/8 bg-white/[0.04] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-ink-soft focus:border-violet/30 focus:bg-white/[0.06]"
                placeholder={meta.searchPlaceholder}
                type="text"
              />
            </div>
            <div className="lg:hidden">
              <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
                {appNavigation.map((item) => (
                  <NavLink
                    key={item.path}
                    className={({ isActive }) =>
                      cn(
                        'whitespace-nowrap rounded-full border px-3 py-2 text-sm transition',
                        isActive
                          ? 'border-violet/25 bg-violet/12 text-white'
                          : 'border-white/8 bg-white/[0.03] text-ink-muted',
                      )
                    }
                    to={item.path}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 xl:justify-end">
            <div className="hidden sm:block">
              <StatusBadge label={syncLabel} tone="cyan" />
            </div>
            <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-ink-muted transition hover:text-white">
              <Bell className="h-5 w-5" />
              {githubAccount ? (
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-cyan" />
              ) : null}
            </button>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">{identity.name}</p>
                <p className="text-xs text-ink-soft">{identity.role}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-cyan text-sm font-bold text-white">
                {identity.initials}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
