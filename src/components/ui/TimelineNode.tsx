import { Sparkles } from 'lucide-react'

import { StatusBadge } from '@/components/ui/StatusBadge'
import { cn } from '@/lib/cn'
import type { TimelineMilestone } from '@/types'

interface TimelineNodeProps {
  milestone: TimelineMilestone
}

export function TimelineNode({ milestone }: TimelineNodeProps) {
  return (
    <div
      className={cn(
        'relative grid gap-5 lg:grid-cols-[1fr_88px_1fr] lg:gap-8',
        milestone.direction === 'right' ? 'lg:[&>*:first-child]:order-3' : '',
      )}
    >
      <div className={cn(milestone.direction === 'right' ? 'lg:col-start-3' : '')}>
        <div className="surface-panel-strong p-6">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <StatusBadge label={milestone.phase} tone={milestone.accent} />
            <span className="text-xs uppercase tracking-[0.2em] text-ink-soft">
              {milestone.year}
            </span>
          </div>
          <div className="space-y-3">
            <h3 className="font-display text-2xl font-bold text-white">
              {milestone.title}
            </h3>
            <p className="text-sm leading-7 text-ink-muted">{milestone.description}</p>
            <p className="text-sm font-semibold text-white">{milestone.impact}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {milestone.stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-ink-muted"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="relative hidden lg:flex lg:items-start lg:justify-center">
        <div className="absolute bottom-0 top-0 w-px bg-gradient-to-b from-violet via-blue to-cyan" />
        <div className="glow-ring relative mt-16 flex h-14 w-14 items-center justify-center rounded-full bg-canvas-soft">
          <Sparkles className="h-5 w-5 text-cyan" />
        </div>
      </div>
      <div className={cn(milestone.direction === 'right' ? 'lg:col-start-1' : '')} />
    </div>
  )
}
