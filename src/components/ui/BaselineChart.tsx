import { useId } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DayPoint } from '../../lib/stats'
import { EmptyChart } from './ChartCard'

const TICK = { fill: '#a9b8d0', fontSize: 12 }
export const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgba(11,20,48,0.94)',
    border: '1px solid rgba(125,227,255,0.45)',
    borderRadius: 12,
    color: '#F4F7FA',
    fontSize: 12,
    boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
    backdropFilter: 'blur(10px)',
  },
  labelStyle: { color: '#a9b8d0' },
  itemStyle: { color: '#F4F7FA' },
}

export interface ExtraLine {
  data: DayPoint[]
  name: string
  color: string
  baseline?: number
}

type Row = { date: string; label: string; value?: number; extra?: number }

/** Mission-telemetry chart: glowing gradient line over an area fill, dashed baseline and tinted band. */
export function BaselineChart({
  data,
  name,
  unit = '',
  color = '#55C6E8',
  baseline,
  band,
  domain,
  extra,
  emptyMessage,
}: {
  emptyMessage?: string
  data: DayPoint[]
  name: string
  unit?: string
  color?: string
  baseline?: number
  band?: [number, number]
  domain?: [number | 'auto', number | 'auto']
  extra?: ExtraLine
}) {
  const uid = useId().replace(/:/g, '')
  if (data.length < 2) return <EmptyChart message={emptyMessage} />

  // Merge optional second series onto shared labels.
  const byDate = new Map<string, Row>()
  data.forEach((p) => byDate.set(p.date, { date: p.date, label: p.label, value: p.value }))
  extra?.data.forEach((p) => {
    const cur = byDate.get(p.date) ?? { date: p.date, label: p.label }
    byDate.set(p.date, { ...cur, extra: p.value })
  })
  const merged = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
  const lastIdx = merged.reduce((acc, r, i) => (r.value !== undefined ? i : acc), -1)

  const gradId = `${uid}-stroke`
  const fillId = `${uid}-fill`
  const glowId = `${uid}-glow`
  const fmt = (v: unknown) => `${v}${unit ? ` ${unit}` : ''}`

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={merged} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color === '#55C6E8' ? '#b39bff' : color} />
          </linearGradient>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <filter id={glowId} x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid stroke="rgba(244,247,250,0.09)" vertical={false} />
        <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={{ stroke: 'rgba(244,247,250,0.25)' }} minTickGap={24} />
        <YAxis tick={TICK} tickLine={false} axisLine={false} domain={domain ?? ['auto', 'auto']} width={44} />
        <Tooltip
          {...TOOLTIP_STYLE}
          formatter={(v, n, item) => {
            const out = [fmt(v), String(n)] as [string, string]
            if (baseline !== undefined && item?.dataKey === 'value' && typeof v === 'number') {
              const d = Math.round((v - baseline) * 10) / 10
              out[0] = `${fmt(v)} (${d > 0 ? '+' : ''}${d} vs baseline ${baseline})`
            }
            return out
          }}
        />
        {extra && <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 12, color: '#F4F7FA' }} />}
        {band && (
          <ReferenceArea y1={band[0]} y2={band[1]} fill={color} fillOpacity={0.1} stroke={color} strokeOpacity={0.15} ifOverflow="extendDomain" />
        )}
        {baseline !== undefined && (
          <ReferenceLine
            y={baseline}
            stroke="#F4F7FA"
            strokeDasharray="5 4"
            strokeOpacity={0.7}
            ifOverflow="extendDomain"
            label={{ value: `Baseline ${Math.round(baseline * 10) / 10}${unit ? ` ${unit}` : ''}`, fill: '#F4F7FA', fontSize: 11, position: 'insideTopRight' }}
          />
        )}
        {extra?.baseline !== undefined && (
          <ReferenceLine y={extra.baseline} stroke={extra.color} strokeDasharray="5 4" strokeOpacity={0.6} ifOverflow="extendDomain" />
        )}
        <Area
          type="monotone"
          dataKey="value"
          name={name}
          stroke="none"
          fill={`url(#${fillId})`}
          connectNulls
          isAnimationActive={false}
          legendType="none"
          tooltipType="none"
        />
        <Line
          type="monotone"
          dataKey="value"
          name={name}
          stroke={`url(#${gradId})`}
          strokeWidth={2.75}
          style={{ filter: `url(#${glowId})` }}
          dot={(p: { cx?: number; cy?: number; index?: number }) => {
            const { cx, cy, index } = p
            if (cx === undefined || cy === undefined) return <g key={`d-${index}`} />
            const isLast = index === lastIdx
            return (
              <g key={`d-${index}`}>
                {isLast && <circle cx={cx} cy={cy} r={9} fill={color} fillOpacity={0.25} />}
                <circle cx={cx} cy={cy} r={isLast ? 4.5 : 2.5} fill={isLast ? '#F4F7FA' : color} stroke={isLast ? color : 'none'} strokeWidth={2} />
              </g>
            )
          }}
          activeDot={{ r: 5, fill: '#F4F7FA', stroke: color, strokeWidth: 2 }}
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
            strokeDasharray={undefined}
            dot={{ r: 2.5, fill: extra.color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls
            isAnimationActive={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
