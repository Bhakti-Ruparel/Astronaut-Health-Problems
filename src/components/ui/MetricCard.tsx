import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Sparkline } from './Sparkline'

export interface MetricDelta {
  text: string
  /** Direction of change. */
  dir: 'up' | 'down' | 'flat'
  /** Whether this change is an improvement relative to baseline. */
  good: boolean
}

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  delta,
  deltaLabel = 'vs baseline',
  spark,
  sparkColor,
  footer,
  tag,
}: {
  label: string
  value: ReactNode
  unit?: string
  icon?: LucideIcon
  delta?: MetricDelta
  deltaLabel?: string
  spark?: number[]
  sparkColor?: string
  footer?: ReactNode
  tag?: string
}) {
  const DeltaIcon = delta?.dir === 'up' ? ArrowUpRight : delta?.dir === 'down' ? ArrowDownRight : Minus
  return (
    <div className="panel fade-in flex flex-col gap-2 p-4 transition-colors hover:border-cyan/40">
      <div className="flex items-center justify-between gap-2">
        <span className="label-mono">{label}</span>
        {Icon && <Icon size={16} className="text-cyan" aria-hidden="true" />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-3xl font-medium text-white">{value}</span>
        {unit && <span className="font-mono text-sm text-muted">{unit}</span>}
      </div>
      {delta && (
        <div
          className={`flex items-center gap-1 font-mono text-xs ${delta.good ? 'text-ok' : 'text-orange'}`}
        >
          <DeltaIcon size={14} aria-hidden="true" />
          <span>{delta.text}</span>
          <span className="text-muted">{deltaLabel}</span>
        </div>
      )}
      {spark && <Sparkline data={spark} color={sparkColor} />}
      {footer && <div className="text-xs text-muted">{footer}</div>}
      {tag && <span className="font-mono text-[10px] uppercase tracking-wider text-muted/80">{tag}</span>}
    </div>
  )
}
