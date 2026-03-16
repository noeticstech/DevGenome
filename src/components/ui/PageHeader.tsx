import type { ReactNode } from 'react'

import { StatusBadge } from '@/components/ui/StatusBadge'
import type { AccentTone } from '@/types'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description: string
  badge?: string
  badgeTone?: AccentTone
  actions?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  badgeTone = 'violet',
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-4">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            {badge ? <StatusBadge label={badge} tone={badgeTone} /> : null}
          </div>
          <p className="max-w-3xl text-base leading-7 text-ink-muted sm:text-lg">
            {description}
          </p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  )
}
