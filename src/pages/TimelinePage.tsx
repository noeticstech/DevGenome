import { ArrowRight, Download, Share2 } from 'lucide-react'

import { PageHeader } from '@/components/ui/PageHeader'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TimelineNode } from '@/components/ui/TimelineNode'
import { timelineAdoptionJourney, timelineMilestones, timelineStoryCards } from '@/data/timeline'

const actionButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06]'

export function TimelinePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <>
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
        description="A more central, story-driven timeline that makes growth progression and career direction easier to read year over year."
        eyebrow="Timeline"
        title="Developer evolution timeline"
      />

      <div className="grid gap-5 xl:grid-cols-[repeat(3,minmax(0,1fr))_1.1fr]">
        {timelineStoryCards.map((card) => {
          const Icon = card.icon

          return (
            <article key={card.title} className="surface-panel p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
                <Icon className="h-5 w-5 text-cyan" />
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.22em] text-ink-soft">
                {card.title}
              </p>
              <p className="mt-2 font-display text-4xl font-bold text-white">
                {card.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-ink-muted">{card.description}</p>
            </article>
          )
        })}

        <article className="surface-panel-strong p-6">
          <StatusBadge label="Upward trajectory" tone="cyan" />
          <h3 className="mt-6 font-display text-3xl font-bold text-white">
            Emerging full stack platform lead
          </h3>
          <p className="mt-4 text-sm leading-7 text-ink-muted">
            The timeline strongly suggests your next evolution is into architecture-led
            product engineering with deeper production ownership and mentoring loops.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                Sync rate
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-cyan">98.4%</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                Primary direction
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-white">Platform</p>
            </div>
          </div>
        </article>
      </div>

      <SectionCard
        subtitle="The timeline is the centerpiece here, showing more milestones and making year-to-year progression visibly clearer."
        title="Growth story"
      >
        <div className="space-y-12">
          {timelineMilestones.map((milestone) => (
            <TimelineNode key={`${milestone.year}-${milestone.title}`} milestone={milestone} />
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          subtitle="How your toolset and engineering concerns broadened over time."
          title="Tech adoption journey"
        >
          <div className="space-y-4">
            {timelineAdoptionJourney.map((journey) => {
              const Icon = journey.icon

              return (
                <article
                  key={journey.title}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                      <Icon className="h-5 w-5 text-cyan" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-white">
                        {journey.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-ink-muted">
                        {journey.description}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
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
                Architecture-led technical leadership
              </p>
              <p className="mt-4 text-sm leading-7 text-ink-muted">
                The strongest forward-looking signal is not just more coding depth, but
                the ability to guide teams through ambiguous systems work with high trust.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Production security ownership', 'Mentorship loops', 'System design reviews', 'Platform reliability'].map(
                (focus) => (
                  <div
                    key={focus}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <span className="text-sm text-white">{focus}</span>
                    <ArrowRight className="h-4 w-4 text-cyan" />
                  </div>
                ),
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
