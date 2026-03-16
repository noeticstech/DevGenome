import { StatusBadge } from '@/components/ui/StatusBadge'
import type { SkillDatum } from '@/types'

interface GenomeHelixProps {
  score: number
  strands: SkillDatum[]
}

const leftColumnCount = 4

export function GenomeHelix({ score, strands }: GenomeHelixProps) {
  const leftSkills = strands.slice(0, leftColumnCount)
  const rightSkills = strands.slice(leftColumnCount)

  const height = 430
  const width = 420
  const levels = strands.map((strand, index) => {
    const y = 52 + index * ((height - 104) / (strands.length - 1))
    const wave = Math.sin(index * 0.78)
    const leftX = 120 + wave * 26
    const rightX = width - leftX

    return {
      ...strand,
      leftX,
      rightX,
      y,
      radius: 5 + strand.value / 24,
    }
  })

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_1.2fr_1fr]">
      <div className="space-y-4">
        {leftSkills.map((strand) => (
          <div
            key={strand.label}
            className="rounded-3xl border border-white/8 bg-white/[0.03] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">{strand.label}</p>
                {strand.detail ? (
                  <p className="text-xs text-ink-soft">{strand.detail}</p>
                ) : null}
              </div>
              <span className="font-display text-2xl font-bold text-cyan">
                {strand.value}
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet via-violet-soft to-cyan"
                style={{ width: `${strand.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="relative overflow-hidden rounded-[36px] border border-violet/20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.24),_transparent_40%),radial-gradient(circle_at_bottom,_rgba(34,211,238,0.18),_transparent_32%),linear-gradient(180deg,rgba(18,11,36,0.94),rgba(8,4,21,0.98))] p-5">
        <div className="absolute inset-0 subtle-grid opacity-30" />
        <div className="relative flex items-center justify-between">
          <StatusBadge label={`Genome score ${score}`} tone="violet" />
          <StatusBadge label="Signature visualization" tone="cyan" />
        </div>
        <svg
          className="relative mt-5 h-[430px] w-full"
          fill="none"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <linearGradient id="helixStroke" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="rungStroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(34,211,238,0.8)" />
              <stop offset="100%" stopColor="rgba(192,132,252,0.85)" />
            </linearGradient>
          </defs>
          <path
            d={levels
              .map((level, index) =>
                `${index === 0 ? 'M' : 'C'} ${level.leftX} ${level.y} ${level.leftX + 28} ${level.y + 16} ${level.leftX} ${level.y}`,
              )
              .join(' ')}
            opacity="0"
          />
          {levels.map((level, index) => (
            <g key={level.label}>
              {index < levels.length - 1 ? (
                <>
                  <path
                    d={`M ${level.leftX} ${level.y} C ${level.leftX + 64} ${level.y + 20} ${levels[index + 1].leftX - 64} ${levels[index + 1].y - 20} ${levels[index + 1].leftX} ${levels[index + 1].y}`}
                    stroke="url(#helixStroke)"
                    strokeLinecap="round"
                    strokeOpacity="0.72"
                    strokeWidth="6"
                  />
                  <path
                    d={`M ${level.rightX} ${level.y} C ${level.rightX - 64} ${level.y + 20} ${levels[index + 1].rightX + 64} ${levels[index + 1].y - 20} ${levels[index + 1].rightX} ${levels[index + 1].y}`}
                    stroke="url(#helixStroke)"
                    strokeLinecap="round"
                    strokeOpacity="0.72"
                    strokeWidth="6"
                  />
                </>
              ) : null}
              <line
                stroke="url(#rungStroke)"
                strokeLinecap="round"
                strokeOpacity="0.55"
                strokeWidth={2 + level.value / 24}
                x1={level.leftX}
                x2={level.rightX}
                y1={level.y}
                y2={level.y}
              />
              <circle
                cx={level.leftX}
                cy={level.y}
                fill="#22d3ee"
                fillOpacity="0.95"
                r={level.radius}
              />
              <circle
                cx={level.rightX}
                cy={level.y}
                fill="#c084fc"
                fillOpacity="0.95"
                r={level.radius}
              />
            </g>
          ))}
        </svg>
        <div className="relative mt-2 grid gap-3 rounded-3xl border border-white/8 bg-black/20 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
              Dominant mode
            </p>
            <p className="mt-2 text-sm font-semibold text-white">Systems-first builder</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
              Highest strand
            </p>
            <p className="mt-2 text-sm font-semibold text-white">System Design</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">
              Next unlock
            </p>
            <p className="mt-2 text-sm font-semibold text-white">Production security</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {rightSkills.map((strand) => (
          <div
            key={strand.label}
            className="rounded-3xl border border-white/8 bg-white/[0.03] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">{strand.label}</p>
                {strand.detail ? (
                  <p className="text-xs text-ink-soft">{strand.detail}</p>
                ) : null}
              </div>
              <span className="font-display text-2xl font-bold text-violet-soft">
                {strand.value}
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue via-violet-soft to-violet"
                style={{ width: `${strand.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
