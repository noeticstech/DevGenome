import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface SectionCardProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <section className={cn('surface-panel relative overflow-hidden', className)}>
      {(title || subtitle || action) && (
        <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            {title ? (
              <h3 className="font-display text-xl font-bold text-white">{title}</h3>
            ) : null}
            {subtitle ? (
              <p className="max-w-2xl text-sm text-ink-muted">{subtitle}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      <div className={cn('px-6 py-6', contentClassName)}>{children}</div>
    </section>
  )
}
