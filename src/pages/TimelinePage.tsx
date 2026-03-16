import { ArrowRight, Download, Share2, Sparkles } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLoadingState } from '@/components/ui/PageLoadingState'
import { SectionCard } from '@/components/ui/SectionCard'
import { StateNotice } from '@/components/ui/StateNotice'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TimelineNode } from '@/components/ui/TimelineNode'
import { useApiResource } from '@/hooks/useApiResource'
import { useWorkspaceRefresh } from '@/hooks/useWorkspaceRefresh'
import { getTimelineData } from '@/lib/api/product'
import {
  formatDate,
  getProductStateDescription,
  getProductStateLabel,
  mapTimelineEventsToMilestones,
} from '@/lib/productPresentation'

const actionButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70'

export function TimelinePage() {
  const { data, error, isLoading, refresh } = useApiResource(getTimelineData)
  const { error: refreshError, isRefreshing, runRefresh } = useWorkspaceRefresh()

  const handleWorkspaceRefresh = async () => {
    await runRefresh()
    await refresh()
  }

  const milestones = data ? mapTimelineEventsToMilestones(data.events) : []
  const storyCards = data
    ? [
        {
          title: 'Growth stage',
          value: data.summary.growthStage,
          description: 'Current narrative stage inferred from your stored journey.',
        },
        {
          title: 'Years tracked',
          value: `${data.summary.yearsTracked}`,
          description: 'The time window represented in the persisted timeline.',
        },
        {
          title: 'Milestones',
          value: `${data.summary.milestonesCount}`,
          description: 'Meaningful timeline events identified from synced data.',
        },
        {
          title: 'Stack expansion',
          value: `${data.summary.stackExpansionCount}`,
          description: 'Distinct technology expansion moments detected so far.',
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
              {isRefreshing ? 'Refreshing timeline' : 'Refresh timeline'}
            </button>
            <button className={actionButtonClass} type="button">
              <Download className="h-4 w-4" />
              Export genome data
            </button>
            <button className={actionButtonClass} type="button">
              <Share2 className="h-4 w-4" />
              Share profile
            </button>
          </>
        }
        badge="Narrative view"
        badgeTone="cyan"
        description="A story-driven timeline that makes growth progression and career direction easier to read from real persisted milestones."
        eyebrow="Timeline"
        title="Developer evolution timeline"
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
          title="Timeline refresh needs attention"
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
              Retry timeline
            </button>
          }
          description={error.message}
          title="Unable to load the timeline"
        />
      ) : null}

      {!isLoading && !error && data ? (
        <>
          <div className="grid gap-5 xl:grid-cols-[repeat(3,minmax(0,1fr))_1.1fr]">
            {storyCards.slice(0, 3).map((card) => (
              <article key={card.title} className="surface-panel p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
                  <Sparkles className="h-5 w-5 text-cyan" />
                </div>
                <p className="mt-6 text-xs uppercase tracking-[0.22em] text-ink-soft">
                  {card.title}
                </p>
                <p className="mt-2 font-display text-4xl font-bold text-white">
                  {card.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-ink-muted">{card.description}</p>
              </article>
            ))}

            <article className="surface-panel-strong p-6">
              <StatusBadge label="Growth trajectory" tone="cyan" />
              <h3 className="mt-6 font-display text-3xl font-bold text-white">
                {data.nextEvolution.title ?? data.summary.growthStage}
              </h3>
              <p className="mt-4 text-sm leading-7 text-ink-muted">
                {data.nextEvolution.description ??
                  'Next evolution suggestions will appear as more timeline evidence accumulates.'}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Repository growth
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold text-cyan">
                    {data.growthMetrics.repositoryGrowth.at(-1)?.value ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Tech breadth
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold text-white">
                    {data.growthMetrics.technologyBreadth.at(-1)?.value ?? 0}
                  </p>
                </div>
              </div>
            </article>
          </div>

          <SectionCard
            subtitle="The timeline is the centerpiece here, showing milestones and making progression visibly clearer over time."
            title="Growth story"
          >
            {milestones.length ? (
              <div className="space-y-12">
                {milestones.map((milestone) => (
                  <TimelineNode key={`${milestone.year}-${milestone.title}`} milestone={milestone} />
                ))}
              </div>
            ) : (
              <EmptyState
                description="Timeline milestones will appear after sync and analysis have enough data to infer your journey."
                title="No timeline milestones yet"
              />
            )}
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <SectionCard
              subtitle="How your toolset and engineering concerns broadened over time."
              title="Tech adoption journey"
            >
              {data.technologyJourney.length ? (
                <div className="space-y-4">
                  {data.technologyJourney.map((journey) => (
                    <article
                      key={journey.period}
                      className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                          <Sparkles className="h-5 w-5 text-cyan" />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-white">
                            {journey.period}
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {journey.technologies.map((technology) => (
                              <span
                                key={technology}
                                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-ink-muted"
                              >
                                {technology}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  description="Technology adoption moments will appear after analysis identifies meaningful stack expansion."
                  title="No technology journey yet"
                />
              )}
            </SectionCard>

            <SectionCard
              subtitle="A forward-looking view of the next skills and responsibilities likely to compound your momentum."
              title="Next evolution"
            >
              <div className="space-y-5">
                <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
                    Next phase
                  </p>
                  <p className="mt-3 font-display text-3xl font-bold text-white">
                    {data.nextEvolution.title ?? 'Keep compounding recent strengths'}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-ink-muted">
                    {data.nextEvolution.description ??
                      'DevGenome will suggest a clearer next direction as more milestones accumulate.'}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(data.nextEvolution.focusAreas.length
                    ? data.nextEvolution.focusAreas
                    : ['Continue recent momentum']
                  ).map((focus) => (
                    <div
                      key={focus}
                      className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                    >
                      <span className="text-sm text-white">{focus}</span>
                      <ArrowRight className="h-4 w-4 text-cyan" />
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            subtitle="Selected turning points and chart-friendly growth snapshots built from persisted analysis output."
            title="Milestone highlights"
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
              <div className="space-y-4">
                {data.milestoneHighlights.length ? (
                  data.milestoneHighlights.map((highlight) => (
                    <article
                      key={`${highlight.title}-${highlight.eventDate}`}
                      className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                    >
                      <StatusBadge label={highlight.eventType} tone="violet" />
                      <h3 className="mt-4 font-display text-xl font-bold text-white">
                        {highlight.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-ink-muted">
                        {highlight.description}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-ink-soft">
                        {formatDate(highlight.eventDate)}
                      </p>
                    </article>
                  ))
                ) : (
                  <EmptyState
                    description="Highlights will appear as soon as the timeline generator has enough evidence."
                    title="No highlight cards yet"
                  />
                )}
              </div>

              <div className="space-y-4 lg:col-span-2">
                <MetricStrip
                  items={data.growthMetrics.repositoryGrowth}
                  title="Repository growth"
                />
                <MetricStrip
                  items={data.growthMetrics.activityGrowth}
                  title="Activity growth"
                />
                <MetricStrip
                  items={data.growthMetrics.technologyBreadth}
                  title="Technology breadth"
                />
              </div>
            </div>
          </SectionCard>
        </>
      ) : null}
    </div>
  )
}

function MetricStrip({
  title,
  items,
}: {
  title: string
  items: Array<{ period: string; value: number }>
}) {
  return (
    <article className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
      <h3 className="font-display text-xl font-bold text-white">{title}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={`${title}-${item.period}`}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                {item.period}
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-white">
                {item.value}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-muted">No growth data yet.</p>
        )}
      </div>
    </article>
  )
}
