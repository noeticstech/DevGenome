import type { HeatmapWeek } from '@/types'

interface CommitHeatmapProps {
  weeks: HeatmapWeek[]
}

const intensityClasses = [
  'bg-white/[0.04]',
  'bg-violet/35',
  'bg-violet/55',
  'bg-violet',
  'bg-cyan',
]

export function CommitHeatmap({ weeks }: CommitHeatmapProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <span>Less</span>
          {intensityClasses.map((className) => (
            <span
              key={className}
              className={`h-3 w-3 rounded-[4px] ${className}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <div className="min-w-[720px]">
          <div
            className="mb-3 grid gap-2 text-xs uppercase tracking-[0.18em] text-ink-soft"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
          >
            {weeks.map((week, index) => (
              <span key={`${week.label}-${index}`} className="text-center">
                {week.label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-4">
            <div className="grid grid-rows-7 gap-2 pt-1 text-xs text-ink-soft">
              {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((day, index) => (
                <span key={`${day}-${index}`} className="h-4 leading-4">
                  {day}
                </span>
              ))}
            </div>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
            >
              {weeks.map((week, weekIndex) => (
                <div key={`${week.label}-${weekIndex}`} className="grid grid-rows-7 gap-2">
                  {week.cells.map((cell) => (
                    <div
                      key={cell.label}
                      className={`h-4 rounded-[4px] ${intensityClasses[cell.count]}`}
                      title={`${cell.label}: ${cell.count}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
