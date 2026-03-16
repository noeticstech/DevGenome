import {
  ArrowRight,
  BrainCircuit,
  FolderGit2,
  Languages,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { LanguageDonutChart } from '@/components/charts/LanguageDonutChart'
import { RadarSkillChart } from '@/components/charts/RadarSkillChart'
import { ChartCard } from '@/components/ui/ChartCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { InsightCard } from '@/components/ui/InsightCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLoadingState } from '@/components/ui/PageLoadingState'
import { SectionCard } from '@/components/ui/SectionCard'
import { StateNotice } from '@/components/ui/StateNotice'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useApiResource } from '@/hooks/useApiResource'
import { useWorkspaceRefresh } from '@/hooks/useWorkspaceRefresh'
import { getDashboardData } from '@/lib/api/product'
import {
  formatDate,
  formatNumber,
  formatRelativeTime,
  getProductStateDescription,
  getProductStateLabel,
  mapChartDataToSkillData,
  mapLanguageDistributionToChart,
} from '@/lib/productPresentation'

const actionButtonClass =
  'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70'

const insightIcons = [Sparkles, BrainCircuit, TrendingUp, Target]

export function DashboardPage() {
  const { data, error, isLoading, refresh } = useApiResource(getDashboardData)
  const { error: refreshError, isRefreshing, runRefresh } = useWorkspaceRefresh()

  const handleWorkspaceRefresh = async () => {
    await runRefresh()
    await refresh()
  }

  const languageChart = data
    ? mapLanguageDistributionToChart(data.languageDistribution.items)
    : []

  const radarData = data ? mapChartDataToSkillData(data.skillRadar.items) : []

  const metrics = data
    ? [
        {
          title: 'Genome score',
          value:
            data.overview.genomeScore.value === null
              ? '—'
              : `${data.overview.genomeScore.value}`,
          description:
            data.overview.genomeScore.generatedAt
              ? `Generated ${formatRelativeTime(data.overview.genomeScore.generatedAt)}`
              : 'Available after analysis runs.',
          icon: Sparkles,
          accent: 'violet' as const,
          change: data.overview.genomeScore.statusLabel ?? undefined,
        },
        {
          title: 'Repositories',
          value: formatNumber(data.overview.repositories.value),
          description: data.overview.repositories.label,
          icon: FolderGit2,
          accent: 'cyan' as const,
        },
        {
          title: 'Languages',
          value: formatNumber(data.overview.languages.value),
          description: data.overview.languages.label,
          icon: Languages,
          accent: 'blue' as const,
        },
        {
          title: 'Learning velocity',
          value: data.overview.learningVelocity.label ?? 'Pending',
          description:
            data.overview.learningVelocity.value === null
              ? 'Requires analysis signals'
              : `${data.overview.learningVelocity.value} / 100 confidence`,
          icon: TrendingUp,
          accent: 'violet' as const,
        },
      ]
    : []

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <>
            <button
              className={actionButtonClass}
              disabled={isRefreshing}
              onClick={() => void handleWorkspaceRefresh()}
              type="button"
            >
              {isRefreshing ? 'Refreshing workspace' : 'Refresh workspace'}
            </button>
            <Link className={actionButtonClass} to="/genome">
              Open genome
            </Link>
            <Link className={actionButtonClass} to="/skills">
              Review skill gap
            </Link>
          </>
        }
        badge={data ? getProductStateLabel(data.meta.state) : 'Live data'}
        description="See the clearest live view of your coding footprint, strongest skills, and next growth opportunities."
        eyebrow="Dashboard"
        title="Genome command center"
      />

      {data && data.meta.state !== 'ready' ? (
        <StateNotice
          actionLabel="Run sync and analysis"
          description={getProductStateDescription(data.meta.state)}
          isActionLoading={isRefreshing}
          onAction={() => void handleWorkspaceRefresh()}
          title={getProductStateLabel(data.meta.state)}
          tone={data.meta.state === 'partial_data' ? 'cyan' : 'violet'}
        />
      ) : null}

      {refreshError ? (
        <StateNotice
          description={refreshError}
          title="Workspace refresh needs attention"
          tone="cyan"
        />
      ) : null}

      {isLoading ? <PageLoadingState /> : null}

      {!isLoading && error ? (
        <ErrorState
          action={
            <button
              className={actionButtonClass}
              onClick={() => void refresh()}
              type="button"
            >
              Retry dashboard
            </button>
          }
          description={error.message}
          title="Unable to load the dashboard"
        />
      ) : null}

      {!isLoading && !error && data ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.title} metric={metric} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
            <ChartCard
              action={
                radarData.length ? (
                  <div className="hidden items-center gap-4 text-xs text-ink-soft md:flex">
                    <span>{data.skillRadar.items.length} tracked skill signals</span>
                  </div>
                ) : null
              }
              subtitle="Core competency overview across the engineering dimensions most visible in your stored activity and analysis output."
              title="Developer skill radar"
            >
              {radarData.length ? (
                <RadarSkillChart data={radarData} />
              ) : (
                <EmptyState
                  description={
                    data.skillRadar.emptyMessage ??
                    'Run analysis to populate skill radar data.'
                  }
                  title="Skill radar is still warming up"
                />
              )}
            </ChartCard>

            <ChartCard
              subtitle="Your current language signal mix across synced repositories."
              title="Language distribution"
            >
              {languageChart.length ? (
                <>
                  <LanguageDonutChart
                    centerLabel="langs"
                    centerValue={`${languageChart.length}`}
                    data={languageChart}
                  />
                  <div className="mt-4 space-y-3">
                    {languageChart.map((language) => (
                      <div
                        key={language.name}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: language.color }}
                          />
                          <span className="text-white">{language.name}</span>
                        </div>
                        <span className="text-ink-muted">{language.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  description={
                    data.languageDistribution.emptyMessage ??
                    'Sync GitHub repositories to calculate language distribution.'
                  }
                  title="No language data yet"
                />
              )}
            </ChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr_0.95fr]">
            <SectionCard
              subtitle="Repositories contributing signal into your current Developer Genome."
              title="Recent activity"
            >
              {data.recentActivity.items.length ? (
                <div className="space-y-3">
                  {data.recentActivity.items.map((repo) => (
                    <div
                      key={repo.fullName}
                      className="flex items-center justify-between gap-4 rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4"
                    >
                      <div>
                        <p className="font-semibold text-white">{repo.repositoryName}</p>
                        <p className="mt-1 text-sm text-ink-muted">{repo.insight}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-cyan">
                          {repo.activityCount} activity points
                        </p>
                        <p className="text-xs text-ink-soft">
                          {repo.lastUpdatedAt
                            ? formatRelativeTime(repo.lastUpdatedAt)
                            : repo.primaryLanguage ?? 'Repository signal'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  description={
                    data.recentActivity.emptyMessage ??
                    'Recent repository activity will appear after a successful sync.'
                  }
                  title="No recent activity yet"
                />
              )}
            </SectionCard>

            <ChartCard
              subtitle="The current analysis output for your learning velocity, based on recent stack growth and activity recency."
              title="Learning velocity"
            >
              <div className="space-y-5">
                <div className="rounded-[32px] border border-violet/20 bg-violet/10 p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
                    Current label
                  </p>
                  <p className="mt-3 font-display text-4xl font-bold text-white">
                    {data.overview.learningVelocity.label ?? 'Pending'}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">
                    {data.highlights[0] ??
                      'Run analysis to generate a stronger learning velocity narrative.'}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                      Velocity score
                    </p>
                    <p className="mt-2 font-display text-3xl font-bold text-white">
                      {data.overview.learningVelocity.value ?? '—'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                      Last analysis
                    </p>
                    <p className="mt-2 font-display text-3xl font-bold text-white">
                      {data.meta.lastAnalysisAt ? formatShortDate(data.meta.lastAnalysisAt) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </ChartCard>

            <SectionCard
              action={
                data.skillGapTeaser.readinessScore !== null ? (
                  <StatusBadge
                    label={`${Math.round(data.skillGapTeaser.readinessScore)}% match`}
                    tone="violet"
                  />
                ) : null
              }
              subtitle="The most immediate opportunity to improve role readiness."
              title="Skill gap teaser"
            >
              {data.skillGapTeaser.targetRole ? (
                <div className="space-y-5">
                  <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
                      Target profile
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold text-white">
                      {data.skillGapTeaser.targetRole}
                    </p>
                    <p className="mt-2 text-sm text-ink-muted">
                      {data.skillGapTeaser.actionHint ?? 'Open the detailed skill gap report.'}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {data.skillGapTeaser.topMissingSkills.length ? (
                      data.skillGapTeaser.topMissingSkills.map((focus) => (
                        <div
                          key={focus}
                          className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                        >
                          <span className="text-sm text-white">{focus}</span>
                          <ArrowRight className="h-4 w-4 text-cyan" />
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        description="Your strongest growth areas will appear here after analysis."
                        title="No gaps highlighted yet"
                      />
                    )}
                  </div>
                  <Link
                    className="inline-flex items-center gap-2 text-sm font-semibold text-cyan transition hover:text-white"
                    to="/skills"
                  >
                    Open detailed skill plan
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <EmptyState
                  description="Set a target role in Settings to receive a more actionable skill gap summary."
                  title="No role target selected yet"
                />
              )}
            </SectionCard>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {(data.highlights.length ? data.highlights : ['No highlights yet']).map(
              (highlight, index) => {
                const Icon = insightIcons[index % insightIcons.length]

                return (
                  <InsightCard
                    insight={{
                      accent: index % 2 === 0 ? 'cyan' : 'violet',
                      description: highlight,
                      icon: Icon,
                      title: index === 0 ? 'Lead signal' : `Highlight ${index + 1}`,
                      value:
                        index === 0 && data.meta.lastAnalysisAt
                          ? formatDate(data.meta.lastAnalysisAt)
                          : 'Live',
                    }}
                    key={`${highlight}-${index}`}
                  />
                )
              },
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

function formatShortDate(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}
