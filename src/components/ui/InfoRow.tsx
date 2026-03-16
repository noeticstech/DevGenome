import { cn } from '@/lib/cn'

interface InfoRowProps {
  label: string
  value: string
  className?: string
}

export function InfoRow({ label, value, className }: InfoRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0 last:pb-0 first:pt-0',
        className,
      )}
    >
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  )
}
