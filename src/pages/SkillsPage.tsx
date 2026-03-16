import { Link } from 'react-router-dom'

import { RoleComparisonChart } from '@/components/charts/RoleComparisonChart'
import { PageHeader } from '@/components/ui/PageHeader'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import {
  criticalSkillGaps,
  readinessBreakdown,
  skillComparison,
  skillGapOverview,
  skillLearningPath,
  skillProjects,
} from '@/data/skills'

const actionButtonClass =
  'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06]'

export function SkillsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <>
            <Link className={actionButtonClass} to="/timeline">
              View growth timeline
            </Link>
            <Link className={actionButtonClass} to="/genome">
              Open genome
            </Link>
          </>
        }
        badge={`${skillGapOverview.match}% match`}
        badgeTone="violet"
        description="Identify what you already do well, which skills are missing for your target role, and the projects most likely to close the gap."
        eyebrow="Skill gap"
        title="Skill gap detection"
      />

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <SectionCard
          subtitle="Current skills versus target role requirements."
          title="Current skills vs target role requirements"
        >
          <RoleComparisonChart data={skillComparison} />
        </SectionCard>

        <SectionCard
          action={<StatusBadge label={skillGapOverview.targetRole} tone="cyan" />}
          subtitle="A clean readiness snapshot for the role you are optimizing toward."
          title="Readiness score"
        >
          <div className="flex justify-center">
            <ScoreRing label="readiness" value={skillGapOverview.match} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {readinessBreakdown.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                  {item.label}
                </p>
                <p className="mt-2 font-display text-3xl font-bold text-white">
                  {item.value}%
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr_0.95fr]">
        <SectionCard
          subtitle="The most important weak spots to address first."
          title="Critical skill gaps"
        >
          <div className="space-y-4">
            {criticalSkillGaps.map((gap) => {
              const Icon = gap.icon

              return (
                <article
                  key={gap.title}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                      <Icon className="h-5 w-5 text-cyan" />
                    </div>
                    <StatusBadge label={gap.priority} tone={gap.accent} />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold text-white">
                    {gap.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">
                    {gap.description}
                  </p>
                </article>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard
          subtitle="A narrative, step-by-step path from weakness to production-ready strength."
          title="Personalized learning path"
        >
          <div className="space-y-6">
            {skillLearningPath.map((step, index) => (
              <div key={step.title} className="relative pl-8">
                {index < skillLearningPath.length - 1 ? (
                  <div className="absolute left-[11px] top-8 h-[calc(100%+16px)] w-px bg-gradient-to-b from-violet via-blue to-cyan" />
                ) : null}
                <div className="absolute left-0 top-1 h-6 w-6 rounded-full border border-violet/30 bg-violet/20" />
                <div className="space-y-3 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge label={step.stage} tone="violet" />
                    <StatusBadge label={step.duration} tone="blue" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-ink-muted">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {step.outcomes.map((outcome) => (
                      <span
                        key={outcome}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-ink-muted"
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          subtitle="Projects that turn the missing skills into visible, portfolio-ready evidence."
          title="Suggested projects"
        >
          <div className="space-y-4">
            {skillProjects.map((project) => {
              const Icon = project.icon

              return (
                <article
                  key={project.title}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                      <Icon className="h-5 w-5 text-violet-soft" />
                    </div>
                    <StatusBadge label={project.badge} tone="violet" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">
                    {project.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">
                    {project.description}
                  </p>
                </article>
              )
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
