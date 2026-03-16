import { Clock3, Flame, FolderGit2, ScanSearch, Sparkles, Workflow } from 'lucide-react'

import type {
  HeatmapWeek,
  InsightData,
  LanguageDatum,
  MetricCardData,
  RepositoryActivity,
} from '@/types'

export const activityMetrics: MetricCardData[] = [
  {
    title: 'Total commits',
    value: '1,248',
    change: '+12%',
    description: 'Up from last month with stronger consistency across active repositories.',
    icon: Sparkles,
    accent: 'green',
  },
  {
    title: 'Active repos',
    value: '26',
    description: 'Repositories contributing meaningful signal in the current analysis window.',
    icon: FolderGit2,
    accent: 'blue',
  },
  {
    title: 'Coding streak',
    value: '32 days',
    description: 'Longest streak this year, signaling sustained momentum and context retention.',
    icon: Flame,
    accent: 'cyan',
  },
  {
    title: 'Avg commits / week',
    value: '18',
    description: 'Well above the benchmark for your target role cohort.',
    icon: Workflow,
    accent: 'violet',
  },
]

export const activityLanguages: LanguageDatum[] = [
  { name: 'JavaScript', value: 38, color: '#a855f7' },
  { name: 'Python', value: 24, color: '#3b82f6' },
  { name: 'TypeScript', value: 18, color: '#22d3ee' },
  { name: 'SQL', value: 12, color: '#fb923c' },
  { name: 'Other', value: 8, color: '#94a3b8' },
]

export const activityRepositories: RepositoryActivity[] = [
  {
    name: 'devgenome-api',
    commits: 120,
    summary: 'Data contracts and orchestration layers',
    trend: 'High focus',
  },
  {
    name: 'portfolio-site',
    commits: 68,
    summary: 'UI system polish and content engine work',
    trend: 'Steady',
  },
  {
    name: 'leetcode-solutions',
    commits: 54,
    summary: 'Algorithm practice and pattern drills',
    trend: 'Night sessions',
  },
  {
    name: 'infra-lab',
    commits: 42,
    summary: 'Observability, containers, and deployment experiments',
    trend: 'Weekend spikes',
  },
]

export const activityInsights: InsightData[] = [
  {
    title: 'Most active day',
    value: 'Wednesday',
    description: 'Mid-week momentum is strongest for focused implementation work.',
    icon: Clock3,
    accent: 'violet',
  },
  {
    title: 'Peak review depth',
    value: 'Late evening',
    description: 'Your most detailed review sessions cluster after 8 PM local time.',
    icon: ScanSearch,
    accent: 'blue',
  },
  {
    title: 'Commit style',
    value: 'Medium batch',
    description: 'You favor coherent, moderately sized changes instead of giant rewrites.',
    icon: Workflow,
    accent: 'cyan',
  },
  {
    title: 'Framework gravity',
    value: 'React',
    description: 'Frontend contributions still anchor much of your visible repository impact.',
    icon: Sparkles,
    accent: 'orange',
  },
]

export const activityHeatmap: HeatmapWeek[] = Array.from({ length: 28 }, (_, weekIndex) => {
  const monthLabel = ['Sep', '', '', '', 'Oct', '', '', '', 'Nov', '', '', '', 'Dec', '', '', '', 'Jan', '', '', '', 'Feb', '', '', '', 'Mar', '', '', ''][weekIndex] ?? ''

  return {
    label: monthLabel,
    cells: Array.from({ length: 7 }, (_, dayIndex) => {
      const base =
        Math.sin((weekIndex + 2) / 2.4) +
        Math.cos((dayIndex + 1) * 1.1) +
        ((weekIndex + dayIndex) % 3) * 0.45
      const streakBoost = weekIndex > 18 ? 0.7 : 0
      const intensity = Math.max(0, Math.min(4, Math.round(base + streakBoost + 1.7)))

      return {
        label: `Week ${weekIndex + 1}, day ${dayIndex + 1}`,
        count: intensity,
      }
    }),
  }
})
