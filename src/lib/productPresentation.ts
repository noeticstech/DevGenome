import type {
  ChartDatum,
  LanguageDistributionDatum,
  ProductDataState,
  TimelineResponse,
} from '@/lib/api/types'
import type {
  HeatmapWeek,
  LanguageDatum,
  SkillDatum,
  TimelineMilestone,
  UserIdentity,
} from '@/types'

const languagePalette = ['#c084fc', '#22d3ee', '#3b82f6', '#fb923c', '#34d399', '#f43f5e']

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '--'
  }

  return new Intl.NumberFormat('en-US').format(value)
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '--'
  }

  return `${Math.round(value)}%`
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return '--'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return '--'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export function formatRelativeTime(value: string | null | undefined) {
  if (!value) {
    return 'No recent update'
  }

  const now = Date.now()
  const then = new Date(value).getTime()
  const diffMs = then - now
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))

  if (Math.abs(diffHours) < 24) {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(diffDays, 'day')
}

export function mapChartDataToSkillData(items: ChartDatum[]): SkillDatum[] {
  return items.map((item) => ({
    label: item.label,
    value: item.value,
  }))
}

export function mapRoleComparisonData(
  items: Array<{
    label: string
    currentScore: number
    targetScore: number
  }>,
) {
  return items.map((item) => ({
    label: item.label,
    current: item.currentScore,
    target: item.targetScore,
  }))
}

export function mapLanguageDistributionToChart(
  items: LanguageDistributionDatum[],
): LanguageDatum[] {
  return items.map((item, index) => ({
    name: item.language,
    value: Math.round(item.percentage),
    color: languagePalette[index % languagePalette.length],
  }))
}

export function getUserDisplayName(user: {
  displayName?: string | null
  username?: string | null
}) {
  return user.displayName || user.username || 'Developer'
}

export function getUserInitials(user: {
  displayName?: string | null
  username?: string | null
}) {
  const base = getUserDisplayName(user)
  const parts = base
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return 'DG'
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
}

export function getUserSubtitle(user: {
  username?: string | null
  bio?: string | null
  connectedAccounts?: Array<{ provider: string }>
}) {
  if (user.bio) {
    return user.bio
  }

  if (user.username) {
    return `@${user.username}`
  }

  if (user.connectedAccounts?.length) {
    return `${user.connectedAccounts[0].provider.toLowerCase()} linked`
  }

  return 'Metadata-only analysis'
}

export function buildSidebarIdentity(user: {
  displayName?: string | null
  username?: string | null
  bio?: string | null
  connectedAccounts?: Array<{ provider: string }>
}): UserIdentity {
  return {
    name: getUserDisplayName(user),
    role: getUserSubtitle(user),
    level: 'DevGenome workspace',
    initials: getUserInitials(user),
    focus: 'Metadata-only analysis',
    syncLabel: user.connectedAccounts?.length ? 'GitHub connected' : 'Connect GitHub',
  }
}

export function buildWeeklyHeatmap(
  items: Array<{
    bucketStart: string
    bucketEnd: string
    commitCount: number
    activeDays: number
    intensity: number
  }>,
): HeatmapWeek[] {
  return items.map((item) => {
    const start = new Date(item.bucketStart)
    const baseCount = Math.max(0, Math.min(4, item.intensity))
    const cells = Array.from({ length: 7 }, (_, index) => {
      const cellDate = new Date(start)
      cellDate.setUTCDate(start.getUTCDate() + index)
      const shouldLightUp = index < Math.max(1, item.activeDays)
      const count = shouldLightUp ? baseCount : 0

      return {
        label: cellDate.toISOString().slice(0, 10),
        count,
      }
    })

    return {
      label: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(start),
      cells,
    }
  })
}

export function mapTimelineEventsToMilestones(
  events: TimelineResponse['events'],
): TimelineMilestone[] {
  return events.map((event, index) => ({
    year: new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(
      new Date(event.eventDate),
    ),
    title: event.title,
    phase: event.eventType.replace(/_/g, ' '),
    description: event.description,
    stack: [event.iconHint.replace(/_/g, ' ')],
    impact: formatDate(event.eventDate),
    direction: index % 2 === 0 ? 'left' : 'right',
    accent: index % 2 === 0 ? 'violet' : 'cyan',
  }))
}

export function getProductStateLabel(state: ProductDataState) {
  switch (state) {
    case 'needs_sync':
      return 'Connect and sync GitHub'
    case 'needs_analysis':
      return 'Run your first analysis'
    case 'partial_data':
      return 'Partial data available'
    default:
      return 'Ready'
  }
}

export function getProductStateDescription(state: ProductDataState) {
  switch (state) {
    case 'needs_sync':
      return 'Connect GitHub and run your first sync to populate DevGenome.'
    case 'needs_analysis':
      return 'Your GitHub metadata is synced. Run analysis to generate your Developer Genome.'
    case 'partial_data':
      return 'DevGenome has some signals already, but a fresh sync and analysis will improve the profile.'
    default:
      return 'Your workspace is ready.'
  }
}
