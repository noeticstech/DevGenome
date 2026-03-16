import type { AccentTone } from '@/types'
import { cn } from '@/lib/cn'

interface StatusBadgeProps {
  label: string
  tone?: AccentTone
  className?: string
}

const toneStyles: Record<AccentTone, string> = {
  violet: 'border-violet/30 bg-violet/10 text-violet-soft',
  cyan: 'border-cyan/30 bg-cyan/10 text-cyan',
  blue: 'border-blue/30 bg-blue/10 text-blue',
  orange: 'border-orange/30 bg-orange/10 text-orange',
  red: 'border-red/30 bg-red/10 text-red',
  green: 'border-green/30 bg-green/10 text-green',
}

export function StatusBadge({
  label,
  tone = 'violet',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
        toneStyles[tone],
        className,
      )}
    >
      {label}
    </span>
  )
}
