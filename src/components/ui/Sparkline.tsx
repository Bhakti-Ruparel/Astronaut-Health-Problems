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
  if (data.length < 2) return <div style={{ height }} aria-hidden="true" />
  const pts = data.map((v, i) => ({ i, v }))
  return (
    <div style={{ height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={pts} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
