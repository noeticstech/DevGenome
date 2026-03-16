import { ArrowRight, Github, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { LoadingState } from '@/components/ui/LoadingState'
import { StateNotice } from '@/components/ui/StateNotice'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspaceRefresh } from '@/hooks/useWorkspaceRefresh'
import { getGithubAuthStartUrl } from '@/lib/api/auth'
import { formatDate, formatRelativeTime, getUserDisplayName } from '@/lib/productPresentation'
import { loginPlatforms, loginSecurityHighlights } from '@/data/login'

export function LoginPage() {
  const { isAuthenticated, refresh, status, user } = useAuth()
  const { error, isRefreshing, runRefresh, statusMessage } = useWorkspaceRefresh()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const authSuccess = searchParams.get('auth') === 'success'
  const notice = searchParams.get('notice')
  const githubAccount = user?.connectedAccounts.find((account) => account.provider === 'GITHUB')

  useEffect(() => {
    if (authSuccess) {
      void refresh()
    }
  }, [authSuccess, refresh])

  const loadingSteps = useMemo(
    () => [
      {
        label: 'Completing GitHub authentication',
        done: isAuthenticated && !isRefreshing,
        active: authSuccess && status === 'loading',
      },
      {
        label: 'Syncing repository metadata',
        done: Boolean(githubAccount?.lastSyncedAt) && !isRefreshing,
        active: isRefreshing && statusMessage === 'Syncing GitHub metadata',
      },
      {
        label: 'Generating Developer Genome',
        done: !isRefreshing && Boolean(githubAccount?.lastSyncedAt),
        active: isRefreshing && statusMessage === 'Generating Developer Genome',
      },
    ],
    [authSuccess, githubAccount?.lastSyncedAt, isAuthenticated, isRefreshing, status, statusMessage],
  )

  const progress = useMemo(() => {
    if (isRefreshing) {
      return statusMessage === 'Generating Developer Genome' ? 82 : 56
    }

    if (authSuccess && status === 'loading') {
      return 42
    }

    if (githubAccount?.lastSyncedAt) {
      return 100
    }

    if (isAuthenticated) {
      return 35
    }

    return 8
  }, [authSuccess, githubAccount?.lastSyncedAt, isAuthenticated, isRefreshing, status, statusMessage])

  const handleConnectGithub = () => {
    window.location.assign(getGithubAuthStartUrl())
  }

  const handlePrepareWorkspace = async () => {
    const success = await runRefresh()
    await refresh()

    if (success) {
      navigate('/dashboard')
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-center">
        <div className="surface-panel-strong mx-auto w-full max-w-[520px] p-7 sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet to-cyan shadow-[0_16px_40px_rgba(119,58,214,0.4)]">
            <Github className="h-7 w-7 text-white" />
          </div>
          <div className="mt-8 text-center">
            <h1 className="font-display text-4xl font-bold text-white">
              Connect Your Developer Accounts
            </h1>
            <p className="mt-4 text-base leading-7 text-ink-muted">
              Link GitHub to sync repository metadata and generate your live Developer
              Genome.
            </p>
          </div>

          {notice === 'github_disconnected' ? (
            <div className="mt-6">
              <StateNotice
                description="GitHub was disconnected successfully. Historical DevGenome data remains until you choose to delete it."
                title="GitHub disconnected"
                tone="cyan"
              />
            </div>
          ) : null}

          {notice === 'signed_out' ? (
            <div className="mt-6">
              <StateNotice
                description="Your session has been cleared safely."
                title="Signed out"
                tone="cyan"
              />
            </div>
          ) : null}

          {authSuccess && isAuthenticated ? (
            <div className="mt-6">
              <StateNotice
                description="GitHub is connected. Run a sync to populate the live product pages with your latest metadata."
                title="GitHub connected"
                tone="cyan"
              />
            </div>
          ) : null}

          {isAuthenticated ? (
            <div className="mt-8 space-y-4">
              <div className="rounded-3xl border border-cyan/20 bg-cyan/10 p-5 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan">
                      Connected account
                    </p>
                    <p className="mt-3 font-display text-3xl font-bold text-white">
                      {getUserDisplayName(user ?? {})}
                    </p>
                    <p className="mt-2 text-sm text-ink-muted">
                      {githubAccount?.username
                        ? `GitHub linked as @${githubAccount.username}`
                        : 'GitHub is connected and ready to sync.'}
                    </p>
                  </div>
                  <StatusBadge label="Connected" tone="cyan" />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                      Last sync
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {githubAccount?.lastSyncedAt
                        ? formatRelativeTime(githubAccount.lastSyncedAt)
                        : 'Not synced yet'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                      Account created
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatDate(user?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 text-left text-canvas transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isRefreshing}
                onClick={handlePrepareWorkspace}
                type="button"
              >
                <span className="flex items-center gap-3 text-sm font-semibold">
                  <Github className="h-5 w-5" />
                  {githubAccount?.lastSyncedAt
                    ? 'Refresh sync and analysis'
                    : 'Run first sync and analysis'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-sm leading-6 text-ink-soft">
                This runs a fresh GitHub metadata sync and regenerates your Developer Genome.
              </p>
            </div>
          ) : (
            <>
              <button
                className="mt-8 flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 text-left text-canvas transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={status === 'loading'}
                onClick={handleConnectGithub}
                type="button"
              >
                <span className="flex items-center gap-3 text-sm font-semibold">
                  <Github className="h-5 w-5" />
                  Connect GitHub
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="mt-4 text-sm leading-6 text-ink-soft">
                DevGenome reads repository metadata, language usage, and activity summaries
                through GitHub OAuth.
              </p>
            </>
          )}

          <div className="mt-6 space-y-3">
            {loginPlatforms
              .filter((platform) => platform.status === 'coming-soon')
              .map((platform) => {
                const Icon = platform.icon

                return (
                  <div
                    key={platform.name}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-ink-soft"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <StatusBadge label="Soon" tone="violet" />
                  </div>
                )
              })}
          </div>

          <div className="mt-8">
            <LoadingState
              description={
                error
                  ? error
                  : isRefreshing
                    ? 'DevGenome is syncing metadata and regenerating your latest analysis.'
                    : authSuccess && status === 'loading'
                      ? 'Completing GitHub sign-in and restoring your authenticated workspace.'
                      : isAuthenticated
                        ? 'Your account is connected. Run a sync whenever you want to refresh the product data.'
                        : 'Connect GitHub to start the real DevGenome sync and analysis pipeline.'
              }
              progress={progress}
              steps={loadingSteps}
              title={
                isRefreshing
                  ? 'Preparing your workspace'
                  : isAuthenticated
                    ? 'Workspace connection'
                    : 'Connection progress'
              }
            />
          </div>

          <div className="mt-6 rounded-3xl border border-cyan/20 bg-cyan/10 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan" />
              <div className="space-y-2">
                <p className="font-semibold text-white">Security by design</p>
                <p className="text-sm leading-6 text-ink-muted">
                  DevGenome uses metadata-only analysis. Source code storage remains disabled.
                </p>
              </div>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-full bg-violet px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-soft"
                to="/dashboard"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
                to="/settings"
              >
                Review settings
              </Link>
            </div>
          ) : null}
        </div>

        <div className="space-y-8">
          <div>
            <span className="eyebrow">Connect once, explore everywhere</span>
            <h2 className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl">
              A focused connection flow that now uses the live DevGenome backend
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">
              GitHub OAuth, sync, and analysis are now wired end to end. This screen stays
              clean, but it now reflects real account state and prepares the workspace with
              the actual backend pipeline.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {loginSecurityHighlights.map((item) => {
              const Icon = item.icon

              return (
                <article key={item.title} className="surface-panel p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
                    <Icon className="h-5 w-5 text-cyan" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">{item.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
