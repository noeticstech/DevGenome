import {
  AlertTriangle,
  CheckCircle2,
  Layers3,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { RoleComparisonChart } from '@/components/charts/RoleComparisonChart'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLoadingState } from '@/components/ui/PageLoadingState'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { SectionCard } from '@/components/ui/SectionCard'
import { StateNotice } from '@/components/ui/StateNotice'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useApiResource } from '@/hooks/useApiResource'
import { useWorkspaceRefresh } from '@/hooks/useWorkspaceRefresh'
import { getSkillsData } from '@/lib/api/product'
import {
  getProductStateDescription,
  getProductStateLabel,
  mapRoleComparisonData,
} from '@/lib/productPresentation'

const actionButtonClass =
  'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70'

const priorityToneMap = {
  high: 'red',
  medium: 'orange',
  low: 'cyan',
} as const

export function SkillsPage() {
  const { data, error, isLoading, refresh } = useApiResource(getSkillsData)
  const { error: refreshError, isRefreshing, runRefresh } = useWorkspaceRefresh()

  const comparisonChart = data ? mapRoleComparisonData(data.comparison.items) : []

  const handleWorkspaceRefresh = async () => {
    await runRefresh()
    await refresh()
  }

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
              {isRefreshing ? 'Refreshing skills' : 'Refresh skills'}
            </button>
            <Link className={actionButtonClass} to="/timeline">
              View growth timeline
            </Link>
            <Link className={actionButtonClass} to="/genome">
              Open genome
            </Link>
          </>
        }
        badge={data?.targetRole.readinessScore != null ? `${Math.round(data.targetRole.readinessScore)}% match` : 'Skill gap'}
        badgeTone="violet"
        description="Identify what you already do well, which skills are missing for your target role, and the projects most likely to close the gap."
        eyebrow="Skill gap"
        title="Skill gap detection"
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
          title="Skill refresh needs attention"
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
              Retry skills
            </button>
          }
          description={error.message}
          title="Unable to load the skill gap report"
        />
      ) : null}

      {!isLoading && !error && data ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
            <SectionCard
              subtitle="Current skills versus target role requirements."
              title="Current skills vs target role requirements"
            >
              {comparisonChart.length ? (
                <RoleComparisonChart data={comparisonChart} />
              ) : (
                <EmptyState
                  description="Comparison data appears after skill-gap analysis has been generated."
                  title="No role comparison yet"
                />
              )}
            </SectionCard>

            <SectionCard
              action={<StatusBadge label={data.targetRole.role} tone="cyan" />}
              subtitle="A live readiness snapshot for the role you are optimizing toward."
              title="Readiness score"
            >
              <div className="flex justify-center">
                <ScoreRing label="readiness" value={data.targetRole.readinessScore ?? 0} />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Role target
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold text-white">
                    {data.targetRole.role}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Role fit
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold text-white">
                    {data.targetRole.summary ?? 'Analysis in progress'}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr_0.95fr]">
            <SectionCard
              subtitle="The most important weak spots to address first."
              title="Critical skill gaps"
            >
              {data.missingSkills.items.length ? (
                <div className="space-y-4">
                  {data.missingSkills.items.map((gap) => (
                    <article
                      key={gap.skill}
                      className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                          <AlertTriangle className="h-5 w-5 text-cyan" />
                        </div>
                        <StatusBadge
                          label={gap.priority}
                          tone={priorityToneMap[gap.priority]}
                        />
                      </div>
                      <h3 className="mt-5 font-display text-2xl font-bold text-white">
                        {gap.skill}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-ink-muted">{gap.reason}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  description={
                    data.missingSkills.emptyMessage ??
                    'Missing skills will appear here once a role comparison is available.'
                  }
                  title="No missing skills highlighted"
                />
              )}
            </SectionCard>

            <SectionCard
              subtitle="A step-by-step path from current profile to stronger role readiness."
              title="Personalized learning path"
            >
              {data.learningPath.steps.length ? (
                <div className="space-y-6">
                  {data.learningPath.steps.map((step, index) => (
                    <div key={step.title} className="relative pl-8">
                      {index < data.learningPath.steps.length - 1 ? (
                        <div className="absolute left-[11px] top-8 h-[calc(100%+16px)] w-px bg-gradient-to-b from-violet via-blue to-cyan" />
                      ) : null}
                      <div className="absolute left-0 top-1 h-6 w-6 rounded-full border border-violet/30 bg-violet/20" />
                      <div className="space-y-3 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusBadge label={`Step ${step.order}`} tone="violet" />
                        </div>
                        <div>
                          <h3 className="font-display text-2xl font-bold text-white">
                            {step.title}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-ink-muted">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  description="A learning path will appear after skill-gap analysis runs."
                  title="No learning path yet"
                />
              )}
            </SectionCard>

            <SectionCard
              subtitle="Projects that turn the missing skills into visible, portfolio-ready evidence."
              title="Suggested projects"
            >
              {data.suggestedProjects.items.length ? (
                <div className="space-y-4">
                  {data.suggestedProjects.items.map((project) => (
                    <article
                      key={project.title}
                      className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                          <Layers3 className="h-5 w-5 text-violet-soft" />
                        </div>
                        <StatusBadge label={project.impact} tone="violet" />
                      </div>
                      <h3 className="mt-5 font-display text-xl font-bold text-white">
                        {project.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-ink-muted">
                        {project.whyItHelps}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.focusAreas.map((focus) => (
                          <span
                            key={focus}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-ink-muted"
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  description="Suggested projects appear after skill-gap analysis has enough data."
                  title="No project recommendations yet"
                />
              )}
            </SectionCard>
          </div>

          <SectionCard
            subtitle="Confidence-building context based on your strongest current signals."
            title="Strong areas"
          >
            {data.strongAreas.items.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.strongAreas.items.map((area) => (
                  <article
                    key={area.label}
                    className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                        <CheckCircle2 className="h-5 w-5 text-cyan" />
                      </div>
                      <StatusBadge label={`${area.score}%`} tone="cyan" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold text-white">
                      {area.label}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-ink-muted">{area.note}</p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                description="Strong areas will appear here once analysis can compare your live profile against target-role expectations."
                title="No strong-area callouts yet"
              />
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  )
}
