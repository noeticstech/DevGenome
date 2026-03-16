import type { SkillDatum } from '@/types'

interface HeroGenomePreviewProps {
  strands: SkillDatum[]
}

export function HeroGenomePreview({ strands }: HeroGenomePreviewProps) {
  const polygonPoints = ['50,10', '82,26', '74,74', '50,92', '20,70', '18,28'].join(
    ' ',
  )

  return (
    <div className="surface-panel-strong relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-0 subtle-grid opacity-30" />
      <div className="relative grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">
        <div className="flex flex-col items-center justify-center gap-5 rounded-[28px] border border-white/8 bg-white/[0.02] p-6">
          <svg className="h-40 w-40" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="heroPolygon" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <polygon
              fill="rgba(168,85,247,0.18)"
              points={polygonPoints}
              stroke="url(#heroPolygon)"
              strokeWidth="2"
            />
            <circle cx="50" cy="50" fill="#22d3ee" fillOpacity="0.9" r="4" />
          </svg>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
              Complexity profile
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              Premium signal confidence across architecture, systems, and execution.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
                Sample genome
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">
                Genome score: 74
              </h3>
            </div>
            <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
              High confidence
            </span>
          </div>
          <div className="space-y-4">
            {strands.map((strand) => (
              <div key={strand.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-white">{strand.label}</p>
                    {strand.detail ? (
                      <p className="text-xs text-ink-soft">{strand.detail}</p>
                    ) : null}
                  </div>
                  <span className="font-semibold text-cyan">{strand.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet via-violet-soft to-cyan"
                    style={{ width: `${strand.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
