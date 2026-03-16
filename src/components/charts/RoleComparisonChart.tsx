import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface RoleComparisonDatum {
  label: string
  current: number
  target: number
}

interface RoleComparisonChartProps {
  data: RoleComparisonDatum[]
}

export function RoleComparisonChart({ data }: RoleComparisonChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} barGap={10}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            tick={{ fill: '#a89bc9', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis axisLine={false} hide tickLine />
          <Tooltip
            contentStyle={{
              background: '#120b24',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
            }}
          />
          <Legend
            wrapperStyle={{
              color: '#a89bc9',
              fontSize: 12,
              paddingTop: 12,
            }}
          />
          <Bar
            dataKey="current"
            fill="url(#currentGradient)"
            name="Current"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="target"
            fill="rgba(59,130,246,0.12)"
            name="Target"
            radius={[10, 10, 0, 0]}
            stroke="rgba(59,130,246,0.45)"
          />
          <defs>
            <linearGradient id="currentGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
