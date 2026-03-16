import type { InsightData } from '@/types'

import { StatusBadge } from '@/components/ui/StatusBadge'

interface InsightCardProps {
  insight: InsightData
}

export function InsightCard({ insight }: InsightCardProps) {
  const Icon = insight.icon

  return (
    <article className="surface-muted flex h-full flex-col gap-4 px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06]">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <StatusBadge label={insight.value} tone={insight.accent} />
      </div>
      <div className="space-y-2">
        <h4 className="font-display text-lg font-bold text-white">
          {insight.title}
        </h4>
        <p className="text-sm leading-6 text-ink-muted">{insight.description}</p>
      </div>
    </article>
  )
}
