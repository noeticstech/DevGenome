import { cn } from '@/lib/cn'

interface ScoreRingProps {
  value: number
  label: string
  size?: number
  className?: string
}

export function ScoreRing({
  value,
  label,
  size = 184,
  className,
}: ScoreRingProps) {
  const degrees = Math.max(0, Math.min(100, value)) * 3.6

  return (
    <div
      className={cn('relative grid place-items-center rounded-full', className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(#a855f7 0deg, #22d3ee ${degrees}deg, rgba(255,255,255,0.06) ${degrees}deg 360deg)`,
      }}
    >
      <div className="grid place-items-center rounded-full border border-white/8 bg-canvas-soft text-center shadow-[inset_0_0_30px_rgba(0,0,0,0.35)]"
        style={{ width: size - 26, height: size - 26 }}
      >
        <div className="space-y-1">
          <p className="font-display text-4xl font-bold text-white">{value}%</p>
          <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">{label}</p>
        </div>
      </div>
    </div>
  )
}
