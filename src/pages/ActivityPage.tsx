import {
  Activity,
  CalendarRange,
  FolderGit2,
  Flame,
  TrendingUp,
} from 'lucide-react'

import { CommitHeatmap } from '@/components/charts/CommitHeatmap'
import { LanguageDonutChart } from '@/components/charts/LanguageDonutChart'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { InsightCard } from '@/components/ui/InsightCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLoadingState } from '@/components/ui/PageLoadingState'
import { SectionCard } from '@/components/ui/SectionCard'
import { StateNotice } from '@/components/ui/StateNotice'
import { useApiResource } from '@/hooks/useApiResource'
import { useWorkspaceRefresh } from '@/hooks/useWorkspaceRefresh'
import { getActivityData } from '@/lib/api/product'
import {
  buildWeeklyHeatmap,
  formatNumber,
  formatRelativeTime,
  getProductStateDescription,
  getProductStateLabel,
  mapLanguageDistributionToChart,
} from '@/lib/productPresentation'

const actionButtonClass =
  'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70'

export function ActivityPage() {
  const { data, error, isLoading, refresh } = useApiResource(getActivityData)
  const { error: refreshError, isRefreshing, runRefresh } = useWorkspaceRefresh()

  const handleWorkspaceRefresh = async () => {
    await runRefresh()
    await refresh()
  }

  const heatmapWeeks = data ? buildWeeklyHeatmap(data.heatmap.items) : []
  const languageChart = data ? mapLanguageDistributionToChart(data.languageUsage.items) : []

  const metrics = data
    ? [
        {
          title: 'Activity volume',
          value: formatNumber(data.summary.totalCommitCount),
          description: 'Commit activity points across synced repositories',
          icon: Activity,
          accent: 'violet' as const,
        },
        {
          title: 'Active repositories',
          value: formatNumber(data.summary.activeRepositories),
          description: 'Repositories with recent tracked activity',
          icon: FolderGit2,
          accent: 'cyan' as const,
        },
        {
          title: 'Consistency signal',
          value: data.summary.consistencyLabel,
          description: 'Based on weekly activity coverage across the tracked window',
          icon: Flame,
          accent: 'orange' as const,
        },
        {
          title: 'Average weekly commits',
          value: `${Math.round(data.summary.averageWeeklyCommits)}`,
          description: 'Average across the current activity window',
          icon: TrendingUp,
          accent: 'blue' as const,
        },
      ]
    : []

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <button
            className={actionButtonClass}
            disabled={isRefreshing}
            onClick={() => void handleWorkspaceRefresh()}
            type="button"
          >
            {isRefreshing ? 'Refreshing activity' : 'Refresh activity'}
          </button>
        }
        badge="Analytics"
        badgeTone="violet"
        description="Contribution density, language mix, and repository impact powered by your stored DevGenome activity signals."
        eyebrow="Activity"
        title="Activity intelligence"
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
          title="Activity refresh needs attention"
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
              Retry activity
            </button>
          }
          description={error.message}
          title="Unable to load activity analytics"
        />
      ) : null}

      {!isLoading && !error && data ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.title} metric={metric} />
            ))}
          </div>

          <SectionCard
            subtitle="Weekly activity buckets power this heatmap. The UI stays honest to the stored cadence rather than pretending to have perfect daily precision."
            title="Commit activity"
          >
            {heatmapWeeks.length ? (
              <CommitHeatmap weeks={heatmapWeeks} />
            ) : (
              <EmptyState
                description={
                  data.heatmap.emptyMessage ??
                  'Commit heatmap data will appear after GitHub activity is synced.'
                }
                title="No heatmap data yet"
              />
            )}
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
            <SectionCard
              subtitle="Relative share of the languages most visible in your stored coding activity."
              title="Programming language distribution"
            >
              {languageChart.length ? (
                <>
                  <LanguageDonutChart
                    centerLabel="dominant"
                    centerValue={`${languageChart[0]?.value ?? 0}%`}
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
                    data.languageUsage.emptyMessage ??
                    'Language usage will appear once GitHub metadata has been synced.'
                  }
                  title="No language analytics yet"
                />
              )}
            </SectionCard>

            <SectionCard
              subtitle="Repositories where your tracked activity has the highest current impact."
              title="Top repository contributions"
            >
              {data.repositoryContribution.items.length ? (
                <div className="space-y-5">
                  {data.repositoryContribution.items.map((repo) => (
                    <div key={repo.fullName} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="font-semibold text-white">{repo.repositoryName}</p>
                          <p className="mt-1 text-xs text-ink-soft">
                            {repo.activityLevel} · {repo.activeWeeks} active weeks
                          </p>
                        </div>
                        <span className="font-semibold text-violet-soft">
                          {repo.commitCount} commits
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet via-blue to-cyan"
                          style={{
                            width: `${Math.min(100, Math.max(12, repo.commitCount))}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-ink-soft">
                        {repo.lastUpdatedAt
                          ? `Updated ${formatRelativeTime(repo.lastUpdatedAt)}`
                          : repo.primaryLanguage ?? 'Tracked repository'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  description={
                    data.repositoryContribution.emptyMessage ??
                    'Repository contribution summaries appear after activity sync.'
                  }
                  title="No repository contributions yet"
                />
              )}
            </SectionCard>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {data.insights.map((insight) => (
              <InsightCard
                insight={{
                  accent: insight.tone === 'positive' ? 'cyan' : 'violet',
                  description: insight.description,
                  icon: insight.tone === 'positive' ? TrendingUp : CalendarRange,
                  title: insight.title,
                  value: insight.tone === 'positive' ? 'Positive' : 'Steady',
                }}
                key={insight.title}
              />
            ))}
          </div>

          {data.confidenceNote ? (
            <StateNotice
              description={data.confidenceNote}
              title="Activity interpretation note"
              tone="cyan"
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
