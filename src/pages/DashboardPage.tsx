import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { LanguageDonutChart } from '@/components/charts/LanguageDonutChart'
import { LearningVelocityChart } from '@/components/charts/LearningVelocityChart'
import { RadarSkillChart } from '@/components/charts/RadarSkillChart'
import { ChartCard } from '@/components/ui/ChartCard'
import { InsightCard } from '@/components/ui/InsightCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import {
  dashboardInsights,
  dashboardLanguages,
  dashboardMetrics,
  dashboardRadar,
  dashboardRecentActivity,
  dashboardSkillGapFocus,
  dashboardVelocitySeries,
} from '@/data/dashboard'

const actionButtonClass =
  'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06]'

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <>
            <Link className={actionButtonClass} to="/genome">
              Open genome
            </Link>
            <Link className={actionButtonClass} to="/skills">
              Review skill gap
            </Link>
          </>
        }
        badge="Live preview"
        description="See the clearest high-level view of your coding footprint, strongest skills, and next growth opportunities."
        eyebrow="Dashboard"
        title="Genome command center"
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <ChartCard
          action={
            <div className="hidden items-center gap-4 text-xs text-ink-soft md:flex">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-soft" />
                Current
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan" />
                Benchmark
              </div>
            </div>
          }
          subtitle="Core competency overview across the engineering dimensions most visible in your recent activity."
          title="Developer skill radar"
        >
          <RadarSkillChart data={dashboardRadar} />
        </ChartCard>

        <ChartCard
          subtitle="Your current language signal mix across active repositories."
          title="Language distribution"
        >
          <LanguageDonutChart
            centerLabel="langs"
            centerValue={`${dashboardLanguages.length}`}
            data={dashboardLanguages}
          />
          <div className="mt-4 space-y-3">
            {dashboardLanguages.map((language) => (
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
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr_0.95fr]">
        <SectionCard
          subtitle="Most recent repositories contributing strong signal into your genome."
          title="Recent activity"
        >
          <div className="space-y-3">
            {dashboardRecentActivity.map((repo) => (
              <div
                key={repo.name}
                className="flex items-center justify-between gap-4 rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <div>
                  <p className="font-semibold text-white">{repo.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">{repo.summary}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-cyan">{repo.commits} commits</p>
                  <p className="text-xs text-ink-soft">{repo.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <ChartCard
          subtitle="Technologies mastered over the last few cycles, trending upward rather than flat."
          title="Learning velocity"
        >
          <LearningVelocityChart data={dashboardVelocitySeries} />
        </ChartCard>

        <SectionCard
          action={<StatusBadge label="72% match" tone="violet" />}
          subtitle="The most immediate opportunity to improve role readiness."
          title="Skill gap teaser"
        >
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
                Target profile
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-white">
                Full Stack Platform Lead
              </p>
            </div>
            <div className="space-y-3">
              {dashboardSkillGapFocus.map((focus) => (
                <div
                  key={focus}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <span className="text-sm text-white">{focus}</span>
                  <ArrowRight className="h-4 w-4 text-cyan" />
                </div>
              ))}
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan transition hover:text-white"
              to="/skills"
            >
              Open detailed skill plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboardInsights.map((insight) => (
          <InsightCard insight={insight} key={insight.title} />
        ))}
      </div>
    </div>
  )
}
