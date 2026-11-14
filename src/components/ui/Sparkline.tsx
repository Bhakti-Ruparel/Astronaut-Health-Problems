import { useId } from 'react'
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'

export function Sparkline({
  data,
  color = '#55C6E8',
  height = 36,
}: {
  data: number[]
  color?: string
  height?: number
}) {
  const gid = useId()
  if (data.length < 2) return <div style={{ height }} aria-hidden="true" />
  const pts = data.map((v, i) => ({ i, v }))
  return (
    <div style={{ height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={pts} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <defs>
            <linearGradient id={`${gid}-s`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={color} stopOpacity={0.6} />
              <stop offset="1" stopColor={color} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line
            type="monotone"
            dataKey="v"
            stroke={`url(#${gid}-s)`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
