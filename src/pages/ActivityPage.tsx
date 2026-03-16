import { CommitHeatmap } from '@/components/charts/CommitHeatmap'
import { LanguageDonutChart } from '@/components/charts/LanguageDonutChart'
import { InsightCard } from '@/components/ui/InsightCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionCard } from '@/components/ui/SectionCard'
import {
  activityHeatmap,
  activityInsights,
  activityLanguages,
  activityMetrics,
  activityRepositories,
} from '@/data/activity'

const maxRepoCommits = Math.max(...activityRepositories.map((repo) => repo.commits))

export function ActivityPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        badge="Analytics"
        badgeTone="violet"
        description="Contribution density, language mix, and repository impact presented in a fuller, more informative analytics flow."
        eyebrow="Activity"
        title="Activity intelligence"
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {activityMetrics.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
      </div>

      <SectionCard
        subtitle="A wider, denser heatmap makes better use of space and reveals streaks, seasonal changes, and quiet gaps more clearly."
        title="Commit activity"
      >
        <CommitHeatmap weeks={activityHeatmap} />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <SectionCard
          subtitle="Relative share of the languages most visible in your recent coding activity."
          title="Programming language distribution"
        >
          <LanguageDonutChart
            centerLabel="dominant"
            centerValue={`${activityLanguages[0]?.value ?? 0}%`}
            data={activityLanguages}
          />
          <div className="mt-4 space-y-3">
            {activityLanguages.map((language) => (
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
        </SectionCard>

        <SectionCard
          subtitle="Repositories where your commit density has the highest impact on the genome profile."
          title="Top repository contributions"
        >
          <div className="space-y-5">
            {activityRepositories.map((repo) => (
              <div key={repo.name} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-white">{repo.name}</p>
                    <p className="mt-1 text-xs text-ink-soft">{repo.summary}</p>
                  </div>
                  <span className="font-semibold text-violet-soft">{repo.commits} commits</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet via-blue to-cyan"
                    style={{ width: `${(repo.commits / maxRepoCommits) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {activityInsights.map((insight) => (
          <InsightCard insight={insight} key={insight.title} />
        ))}
      </div>
    </div>
  )
}
