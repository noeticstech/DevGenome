import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import type { LanguageDatum } from '@/types'

interface LanguageDonutChartProps {
  data: LanguageDatum[]
  centerValue: string
  centerLabel: string
  height?: number
}

export function LanguageDonutChart({
  data,
  centerValue,
  centerLabel,
  height = 280,
}: LanguageDonutChartProps) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="66%"
            outerRadius="84%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display text-4xl font-bold text-white">{centerValue}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-ink-soft">
            {centerLabel}
          </p>
        </div>
      </div>
    </div>
  )
}
