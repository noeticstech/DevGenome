import type { MetricCardData } from '@/types'

import { StatusBadge } from '@/components/ui/StatusBadge'
import { cn } from '@/lib/cn'

interface MetricCardProps {
  metric: MetricCardData
  className?: string
}

export function MetricCard({ metric, className }: MetricCardProps) {
  const Icon = metric.icon

  return (
    <article
      className={cn(
        'surface-panel relative overflow-hidden px-5 py-5 sm:px-6',
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet/40 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-soft">
              {metric.title}
            </p>
            <div className="flex items-end gap-3">
              <p className="font-display text-4xl font-bold text-white">
                {metric.value}
              </p>
              {metric.change ? (
                <StatusBadge label={metric.change} tone={metric.accent} />
              ) : null}
            </div>
          </div>
          <p className="text-sm leading-6 text-ink-muted">{metric.description}</p>
        </div>
        <div className="glow-ring flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </article>
  )
}
