import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

import type { SkillDatum } from '@/types'

interface RadarSkillChartProps {
  data: SkillDatum[]
}

export function RadarSkillChart({ data }: RadarSkillChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: '#a89bc9', fontSize: 12 }}
          />
          <Radar
            dataKey="benchmark"
            fill="rgba(34,211,238,0.08)"
            fillOpacity={0.9}
            stroke="#22d3ee"
            strokeOpacity={0.7}
          />
          <Radar
            dataKey="value"
            fill="rgba(168,85,247,0.26)"
            fillOpacity={1}
            stroke="#c084fc"
            strokeWidth={3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
