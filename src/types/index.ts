import type { LucideIcon } from 'lucide-react'

export type AccentTone = 'violet' | 'cyan' | 'blue' | 'orange' | 'green' | 'red'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  description: string
  badge?: string
}

export interface RouteMeta {
  title: string
  description: string
  searchPlaceholder: string
}

export interface UserIdentity {
  name: string
  role: string
  level: string
  initials: string
  focus: string
  syncLabel: string
}

export interface MetricCardData {
  title: string
  value: string
  description: string
  icon: LucideIcon
  accent: AccentTone
  change?: string
}

export interface SkillDatum {
  label: string
  value: number
  benchmark?: number
  target?: number
  detail?: string
}

export interface LanguageDatum {
  name: string
  value: number
  color: string
}

export interface InsightData {
  title: string
  value: string
  description: string
  icon: LucideIcon
  accent: AccentTone
}

export interface RepositoryActivity {
  name: string
  commits: number
  summary: string
  trend: string
}

export interface SequenceSignal {
  label: string
  value: string
  description: string
  accent: AccentTone
}

export interface HeatmapCell {
  label: string
  count: number
}

export interface HeatmapWeek {
  label: string
  cells: HeatmapCell[]
}

export interface TimelineMilestone {
  year: string
  title: string
  phase: string
  description: string
  stack: string[]
  impact: string
  direction: 'left' | 'right'
  accent: AccentTone
}

export interface LearningStep {
  stage: string
  title: string
  description: string
  duration: string
  outcomes: string[]
}

export interface ConnectedAccount {
  name: string
  description: string
  status: 'connected' | 'coming-soon'
  detail: string
  action: string
  icon: LucideIcon
  accent: AccentTone
}

export interface NotificationSetting {
  label: string
  description: string
  enabled: boolean
}

export interface ThemeOption {
  label: string
  description: string
  icon: LucideIcon
  selected: boolean
}

export interface RoleFit {
  title: string
  alignment: string
  description: string
  highlight: string
  accent: AccentTone
}
