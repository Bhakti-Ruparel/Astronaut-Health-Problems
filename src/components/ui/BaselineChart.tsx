import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DayPoint } from '../../lib/stats'
import { EmptyChart } from './ChartCard'

const TICK = { fill: '#8fa3bd', fontSize: 11 }
export const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#101D35',
    border: '1px solid rgba(85,198,232,0.4)',
    borderRadius: 8,
    color: '#F4F7FA',
    fontSize: 12,
  },
  labelStyle: { color: '#8fa3bd' },
}

export interface ExtraLine {
  data: DayPoint[]
  name: string
  color: string
  baseline?: number
}

/** Line chart with a dashed baseline reference line and an optional baseline band. */
export function BaselineChart({
  data,
  name,
  unit = '',
  color = '#55C6E8',
  baseline,
  band,
  domain,
  extra,
}: {
  data: DayPoint[]
  name: string
  unit?: string
  color?: string
  baseline?: number
  band?: [number, number]
  domain?: [number | 'auto', number | 'auto']
  extra?: ExtraLine
}) {
  if (data.length < 2) return <EmptyChart />

  // Merge optional second series onto shared day labels.
  const byDate = new Map<string, { date: string; label: string; value?: number; extra?: number }>()
  data.forEach((p) => byDate.set(p.date, { date: p.date, label: p.label, value: p.value }))
  extra?.data.forEach((p) => {
    const cur = byDate.get(p.date) ?? { date: p.date, label: p.label }
    byDate.set(p.date, { ...cur, extra: p.value })
  })
  const merged = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={merged} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        <CartesianGrid stroke="rgba(244,247,250,0.08)" vertical={false} />
        <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={{ stroke: 'rgba(244,247,250,0.2)' }} minTickGap={24} />
        <YAxis tick={TICK} tickLine={false} axisLine={false} domain={domain ?? ['auto', 'auto']} width={44} />
        <Tooltip
          {...TOOLTIP_STYLE}
          formatter={(v, n) => [`${v}${unit ? ` ${unit}` : ''}`, String(n)]}
        />
        {band && (
          <ReferenceArea y1={band[0]} y2={band[1]} fill="#55C6E8" fillOpacity={0.08} ifOverflow="extendDomain" />
        )}
        {baseline !== undefined && (
          <ReferenceLine
            y={baseline}
            stroke="#F4F7FA"
            strokeDasharray="5 4"
            strokeOpacity={0.6}
            ifOverflow="extendDomain"
            label={{ value: 'baseline', fill: '#8fa3bd', fontSize: 10, position: 'insideTopRight' }}
          />
        )}
        {extra?.baseline !== undefined && (
          <ReferenceLine y={extra.baseline} stroke={extra.color} strokeDasharray="5 4" strokeOpacity={0.5} ifOverflow="extendDomain" />
        )}
        <Line
          type="monotone"
          dataKey="value"
          name={name}
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls
          isAnimationActive={false}
        />
        {extra && (
          <Line
            type="monotone"
            dataKey="extra"
            name={extra.name}
            stroke={extra.color}
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: extra.color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls
            isAnimationActive={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
