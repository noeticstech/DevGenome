import { ArrowRight, BrainCircuit, Sparkles, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

import { GenomeHelix } from '@/components/devgenome/GenomeHelix'
import { InfoRow } from '@/components/ui/InfoRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLoadingState } from '@/components/ui/PageLoadingState'
import { SectionCard } from '@/components/ui/SectionCard'
import { SkillTag } from '@/components/ui/SkillTag'
import { StateNotice } from '@/components/ui/StateNotice'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useApiResource } from '@/hooks/useApiResource'
import { useWorkspaceRefresh } from '@/hooks/useWorkspaceRefresh'
import { getGenomeData } from '@/lib/api/product'
import {
  formatDate,
  getProductStateDescription,
  getProductStateLabel,
} from '@/lib/productPresentation'

const actionButtonClass =
  'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70'

const cardIcons = [Sparkles, BrainCircuit, Target]

const breakdownToneMap = {
  algorithms: 'bg-orange',
  backend: 'bg-blue',
  frontend: 'bg-violet',
  devops: 'bg-cyan',
  databases: 'bg-cyan',
  system_design: 'bg-violet',
}

export function GenomePage() {
  const { data, error, isLoading, refresh } = useApiResource(getGenomeData)
  const { error: refreshError, isRefreshing, runRefresh } = useWorkspaceRefresh()

  const handleWorkspaceRefresh = async () => {
    await runRefresh()
    await refresh()
  }

  const flattenedStrands =
    data?.visualization.strands.flatMap((group) =>
      group.items.map((item) => ({
        label: item.label,
        value: item.value,
        detail: group.group,
      })),
    ) ?? []

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
              {isRefreshing ? 'Refreshing genome' : 'Refresh genome'}
            </button>
            <Link className={actionButtonClass} to="/skills">
              Compare target roles
            </Link>
            <Link className={actionButtonClass} to="/timeline">
              Open evolution timeline
            </Link>
          </>
        }
        badge={data?.summary.statusLabel ?? 'Genome'}
        badgeTone="cyan"
        description="This is the signature DevGenome view: a live DNA-style map of your engineering strengths, personality, and career fit."
        eyebrow="Genome profile"
        title="Your Developer Genome"
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
          title="Genome refresh needs attention"
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
              Retry genome
            </button>
          }
          description={error.message}
          title="Unable to load the genome profile"
        />
      ) : null}

      {!isLoading && !error && data ? (
        <>
          <SectionCard
            subtitle="A DNA-inspired strand view of the skills and behaviors most responsible for your current profile."
            title="Signature genome visualization"
          >
            {flattenedStrands.length ? (
              <GenomeHelix
                dominantMode={data.archetype.label ?? 'Developer profile'}
                highestStrand={data.skillBreakdown.strongest[0] ?? 'Still forming'}
                nextUnlock={data.visualization.growthAreas[0] ?? 'Keep shipping'}
                score={data.summary.genomeScore ?? 0}
                strands={flattenedStrands.slice(0, 8)}
              />
            ) : (
              <EmptyState
                description="Run analysis to populate the main genome visualization."
                title="Genome strands are not available yet"
              />
            )}
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <SectionCard
              action={
                data.archetype.label ? (
                  <StatusBadge label={data.archetype.label} tone="violet" />
                ) : null
              }
              subtitle={data.summary.subtitle ?? 'Archetype classification is generated from your stored metadata.'}
              title={data.archetype.label ?? 'Developer personality'}
            >
              <p className="text-sm leading-7 text-ink-muted">
                {data.archetype.explanation ??
                  'Your developer archetype will appear here after analysis.'}
              </p>
              <div className="mt-6">
                <InfoRow
                  label="Strongest category"
                  value={data.supportingMeta.strongestCategories[0] ?? '—'}
                />
                <InfoRow
                  label="Growth area"
                  value={data.supportingMeta.weakestCategories[0] ?? '—'}
                />
                <InfoRow
                  label="Generated"
                  value={formatDate(data.supportingMeta.generatedAt)}
                />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(data.archetype.dominantSignals.length
                  ? data.archetype.dominantSignals
                  : ['No dominant signals available yet']
                )
                  .slice(0, 3)
                  .map((signal, index) => {
                    const Icon = cardIcons[index % cardIcons.length]

                    return (
                      <div
                        key={`${signal}-${index}`}
                        className="rounded-3xl border border-white/8 bg-white/[0.03] p-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05]">
                          <Icon className="h-5 w-5 text-cyan" />
                        </div>
                        <h3 className="mt-4 font-display text-lg font-bold text-white">
                          Signal {index + 1}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-ink-muted">{signal}</p>
                      </div>
                    )
                  })}
              </div>
            </SectionCard>

            <SectionCard
              subtitle="Detailed scoring across the traits that most influence role fit and perceived engineering quality."
              title="Skill breakdown"
            >
              {data.skillBreakdown.items.length ? (
                <>
                  <div className="space-y-5">
                    {data.skillBreakdown.items.map((item) => (
                      <div key={item.key} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-white">{item.label}</span>
                          <span className="font-semibold text-ink-muted">{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.06]">
                          <div
                            className={`h-full rounded-full ${
                              breakdownToneMap[
                                item.key as keyof typeof breakdownToneMap
                              ] ?? 'bg-violet'
                            }`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {data.skillBreakdown.strongest.map((label) => (
                      <SkillTag key={label} label={label} tone="cyan" value="Strength" />
                    ))}
                    {data.skillBreakdown.weakest.map((label) => (
                      <SkillTag key={label} label={label} tone="violet" value="Growth area" />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  description="Skill category scores will appear here after analysis runs."
                  title="No skill breakdown yet"
                />
              )}
            </SectionCard>
          </div>

          <SectionCard
            subtitle="The roles and team shapes that map most naturally to your current engineering DNA."
            title="Career fit summary"
          >
            <div className="grid gap-5 lg:grid-cols-3">
              {data.careerFit.primary ? (
                <article className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge
                      label={`${Math.round(data.careerFit.primary.readinessScore)}% match`}
                      tone="cyan"
                    />
                    <ArrowRight className="h-4 w-4 text-cyan" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold text-white">
                    {data.careerFit.primary.targetRole}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">
                    {data.careerFit.primary.summary}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-white">Primary fit</p>
                </article>
              ) : (
                <EmptyState
                  description="Role fit appears after the skill-gap analysis runs."
                  title="Primary fit unavailable"
                />
              )}

              <article className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge
                    label={
                      data.careerFit.secondary
                        ? `${Math.round(data.careerFit.secondary.readinessScore)}% match`
                        : 'Pending'
                    }
                    tone="violet"
                  />
                  <ArrowRight className="h-4 w-4 text-cyan" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-white">
                  {data.careerFit.secondary?.targetRole ?? 'Secondary fit'}
                </h3>
                <p className="mt-3 text-sm leading-7 text-ink-muted">
                  {data.careerFit.secondary
                    ? 'A strong adjacent role if you keep compounding current strengths.'
                    : 'A secondary fit will appear when role-comparison data is available.'}
                </p>
                <p className="mt-4 text-sm font-semibold text-white">Secondary fit</p>
              </article>

              <article className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge label="Growth focus" tone="blue" />
                  <ArrowRight className="h-4 w-4 text-cyan" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-white">
                  Next unlock
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.careerFit.growthFocus.length ? (
                    data.careerFit.growthFocus.map((focus) => (
                      <SkillTag key={focus} label={focus} tone="violet" />
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-ink-muted">
                      Growth focus suggestions appear when the role analysis is available.
                    </p>
                  )}
                </div>
              </article>
            </div>
          </SectionCard>
        </>
      ) : null}
    </div>
  )
}
