import {
  Bot,
  BrainCircuit,
  FolderGit2,
  Gauge,
  Sparkles,
  TimerReset,
  TrendingUp,
  Zap,
} from 'lucide-react'

import type {
  InsightData,
  LanguageDatum,
  MetricCardData,
  RepositoryActivity,
  SkillDatum,
} from '@/types'

export const dashboardMetrics: MetricCardData[] = [
  {
    title: 'Genome score',
    value: '74',
    change: '+2.4%',
    description: 'Composite strength across architecture, delivery, and learning cadence.',
    icon: Sparkles,
    accent: 'green',
  },
  {
    title: 'Repositories',
    value: '26',
    description: 'Active codebases sequenced into the current genome profile.',
    icon: FolderGit2,
    accent: 'blue',
  },
  {
    title: 'Languages',
    value: '5',
    description: 'Primary languages contributing signal weight this quarter.',
    icon: Bot,
    accent: 'cyan',
  },
  {
    title: 'Learning velocity',
    value: 'High',
    change: 'Optimal',
    description: 'New tools are becoming production skills faster than your benchmark cohort.',
    icon: TrendingUp,
    accent: 'violet',
  },
]

export const dashboardRadar: SkillDatum[] = [
  { label: 'Algorithms', value: 82, benchmark: 68 },
  { label: 'Backend', value: 78, benchmark: 72 },
  { label: 'Database', value: 60, benchmark: 55 },
  { label: 'System Design', value: 75, benchmark: 63 },
  { label: 'DevOps', value: 54, benchmark: 46 },
  { label: 'Frontend', value: 70, benchmark: 64 },
]

export const dashboardLanguages: LanguageDatum[] = [
  { name: 'TypeScript', value: 34, color: '#a855f7' },
  { name: 'Python', value: 24, color: '#3b82f6' },
  { name: 'SQL', value: 18, color: '#22d3ee' },
  { name: 'Go', value: 14, color: '#fb923c' },
  { name: 'Rust', value: 10, color: '#94a3b8' },
]

export const dashboardRecentActivity: RepositoryActivity[] = [
  {
    name: 'devgenome-app',
    commits: 24,
    summary: 'Systems modeling and dashboard refinement',
    trend: '2h ago',
  },
  {
    name: 'portfolio-site',
    commits: 11,
    summary: 'Motion polish and content architecture',
    trend: '1d ago',
  },
  {
    name: 'infra-lab',
    commits: 8,
    summary: 'Container orchestration and release scripts',
    trend: '3d ago',
  },
]

export const dashboardVelocitySeries = [
  { label: 'Jan', value: 28 },
  { label: 'Feb', value: 33 },
  { label: 'Mar', value: 37 },
  { label: 'Apr', value: 44 },
  { label: 'May', value: 58 },
  { label: 'Jun', value: 69 },
  { label: 'Jul', value: 78 },
  { label: 'Aug', value: 83 },
]

export const dashboardSkillGapFocus = [
  'API authentication',
  'Database indexing',
  'System design patterns',
]

export const dashboardInsights: InsightData[] = [
  {
    title: 'Most active day',
    value: 'Wednesday',
    description: 'Mid-week commits consistently spike around system-level refactors and reviews.',
    icon: TimerReset,
    accent: 'violet',
  },
  {
    title: 'Peak coding window',
    value: '9 PM - 12 AM',
    description: 'Your deepest implementation sessions cluster in the late-evening flow state.',
    icon: Gauge,
    accent: 'blue',
  },
  {
    title: 'Emerging strength',
    value: 'Platform thinking',
    description: 'Infrastructure and reliability signals are climbing faster than the benchmark.',
    icon: BrainCircuit,
    accent: 'cyan',
  },
  {
    title: 'Best next unlock',
    value: 'Auth systems',
    description: 'Closing the authentication gap would materially improve role readiness immediately.',
    icon: Zap,
    accent: 'orange',
  },
]
