import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface LearningVelocityPoint {
  label: string
  value: number
}

interface LearningVelocityChartProps {
  data: LearningVelocityPoint[]
}

export function LearningVelocityChart({
  data,
}: LearningVelocityChartProps) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="velocityGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" stopOpacity={0.65} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            tick={{ fill: '#7e739a', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis axisLine={false} hide tickLine />
          <Tooltip
            contentStyle={{
              background: '#120b24',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
            }}
            cursor={{ stroke: 'rgba(255,255,255,0.08)' }}
          />
          <Area
            dataKey="value"
            fill="url(#velocityGradient)"
            stroke="#c084fc"
            strokeWidth={3}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
