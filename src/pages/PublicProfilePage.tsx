import { ArrowRight, Globe2, Share2, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { LanguageDonutChart } from '@/components/charts/LanguageDonutChart'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLoadingState } from '@/components/ui/PageLoadingState'
import { SectionCard } from '@/components/ui/SectionCard'
import { SkillTag } from '@/components/ui/SkillTag'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useApiResource } from '@/hooks/useApiResource'
import { getPublicProfileData } from '@/lib/api/sharing'
import {
  formatDate,
  formatPercent,
  mapLanguageDistributionToChart,
} from '@/lib/productPresentation'

const actionButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06]'

export function PublicProfilePage() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const { data, error, isLoading, refresh } = useApiResource(
    () => getPublicProfileData(shareToken ?? ''),
    {
      enabled: Boolean(shareToken),
    },
  )

  const languageChart = data ? mapLanguageDistributionToChart(data.languages.items) : []

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <PageHeader
          actions={
            <Link className={actionButtonClass} to="/login">
              Create your own genome
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
          badge="Shared profile"
          badgeTone="cyan"
          description="A privacy-aware DevGenome profile shared from real metadata-based analysis. Source code storage remains disabled."
          eyebrow="Public DevGenome"
          title={data?.profile.displayName ?? data?.profile.username ?? 'Developer profile'}
        />

        {isLoading ? <PageLoadingState /> : null}

        {!isLoading && error ? (
          <ErrorState
            action={
              <button
                className={actionButtonClass}
                onClick={() => void refresh()}
                type="button"
              >
                Retry shared profile
              </button>
            }
            description={error.message}
            title="Unable to load the shared profile"
          />
        ) : null}

        {!isLoading && !error && data ? (
          <>
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <SectionCard
                action={<StatusBadge label={data.overview.statusLabel ?? 'Shared'} tone="violet" />}
                subtitle={
                  data.profile.bio ??
                  'A public-facing snapshot of the current Developer Genome.'
                }
                title={data.overview.archetypeLabel ?? 'Developer Genome'}
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
                      Genome score
                    </p>
                    <p className="mt-3 font-display text-5xl font-bold text-white">
                      {data.overview.genomeScore ?? '--'}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-ink-muted">
                      {data.overview.summary ??
                        "This shared profile highlights the strongest current signals in the developer's stored DevGenome analysis."}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-cyan/20 bg-cyan/10 p-5">
                      <div className="flex items-center gap-3">
                        <Globe2 className="h-5 w-5 text-cyan" />
                        <p className="text-sm font-semibold text-white">Public profile</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-ink-muted">
                        Metadata-only analysis. Source code storage is disabled.
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
                        Target role
                      </p>
                      <p className="mt-3 font-display text-2xl font-bold text-white">
                        {data.profile.targetRole ?? data.careerFit.primaryRole ?? 'Developer'}
                      </p>
                      <p className="mt-2 text-sm text-ink-muted">
                        Shared {formatDate(data.meta.sharedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                subtitle="The strongest and weakest visible skill signals in the current public profile."
                title="Skill highlights"
              >
                {data.skills.items.length ? (
                  <div className="space-y-5">
                    {data.skills.items.map((item) => (
                      <div key={item.key} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-white">{item.label}</span>
                          <span className="font-semibold text-ink-muted">
                            {formatPercent(item.value)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet via-blue to-cyan"
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {data.skills.strongest.map((item) => (
                        <SkillTag key={item} label={item} tone="cyan" value="Strength" />
                      ))}
                      {data.skills.growthAreas.map((item) => (
                        <SkillTag key={item} label={item} tone="violet" value="Growth" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    description="Skill highlights were not available for this shared profile."
                    title="No skill highlights yet"
                  />
                )}
              </SectionCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <SectionCard
                subtitle="The most visible language signals across the synced repository footprint."
                title="Language mix"
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
                    description="No language distribution was available for this shared profile."
                    title="No language mix yet"
                  />
                )}
              </SectionCard>

              <SectionCard
                subtitle="Why this profile currently fits the roles and growth areas shown here."
                title="Career fit and journey"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <article className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <StatusBadge
                        label={
                          data.careerFit.readinessScore !== null
                            ? `${Math.round(data.careerFit.readinessScore)}% match`
                            : 'Role fit'
                        }
                        tone="cyan"
                      />
                      <Share2 className="h-4 w-4 text-cyan" />
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-bold text-white">
                      {data.careerFit.primaryRole ?? 'Current fit'}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-ink-muted">
                      {data.careerFit.summary ??
                        'This shared profile does not currently expose a role-fit summary.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {data.careerFit.growthFocus.map((focus) => (
                        <SkillTag key={focus} label={focus} tone="violet" />
                      ))}
                    </div>
                  </article>

                  <article className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-cyan" />
                      <p className="text-sm font-semibold text-white">Timeline highlights</p>
                    </div>
                    <div className="mt-5 space-y-4">
                      {data.timeline.highlights.length ? (
                        data.timeline.highlights.map((highlight) => (
                          <div
                            key={`${highlight.title}-${highlight.eventDate}`}
                            className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                          >
                            <p className="font-semibold text-white">{highlight.title}</p>
                            <p className="mt-2 text-sm leading-6 text-ink-muted">
                              {highlight.description}
                            </p>
                            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-ink-soft">
                              {formatDate(highlight.eventDate)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <EmptyState
                          description="No public timeline highlights were available for this profile."
                          title="No milestone highlights yet"
                        />
                      )}
                    </div>
                  </article>
                </div>
              </SectionCard>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
