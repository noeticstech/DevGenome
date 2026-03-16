import { RefreshCw } from 'lucide-react'

import { cn } from '@/lib/cn'

interface StateNoticeProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  isActionLoading?: boolean
  tone?: 'violet' | 'cyan'
}

export function StateNotice({
  title,
  description,
  actionLabel,
  onAction,
  isActionLoading = false,
  tone = 'violet',
}: StateNoticeProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border p-5',
        tone === 'cyan'
          ? 'border-cyan/20 bg-cyan/10'
          : 'border-violet/20 bg-violet/10',
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-bold text-white">{title}</h3>
          <p className="max-w-3xl text-sm leading-7 text-ink-muted">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isActionLoading}
            onClick={onAction}
            type="button"
          >
            <RefreshCw className={cn('h-4 w-4', isActionLoading ? 'animate-spin' : '')} />
            {isActionLoading ? 'Working...' : actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
