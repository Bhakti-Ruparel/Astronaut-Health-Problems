import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ACCENTS, type ModuleId } from '../../lib/theme'
import type { MetricDelta } from '../../lib/metrics'
import { ModuleArt } from '../art/ModuleArt'
import { ProgressRing } from '../ui/ProgressRing'
import { DemoBadge } from '../ui/StatusBadge'
import { Sparkline } from '../ui/Sparkline'

export interface ModuleCardProps {
  id: ModuleId
  label: string
  icon: LucideIcon
  value: ReactNode
  unit?: string
  delta?: MetricDelta
  description: string
  to: string
  tag: 'Measured' | 'Self-reported'
  spark?: number[]
  /** 0-100; renders an orbital ring instead of a sparkline. */
  ring?: number
  secondary?: ReactNode
  className?: string
}

export function ModuleCard({
  id,
  label,
  icon: Icon,
  value,
  unit,
  delta,
  description,
  to,
  tag,
  spark,
  ring,
  secondary,
  className = '',
}: ModuleCardProps) {
  const a = ACCENTS[id]
  const DeltaIcon = delta?.dir === 'up' ? ArrowUpRight : delta?.dir === 'down' ? ArrowDownRight : Minus
  return (
    <Link
      to={to}
      className={`glass glass-accent fade-in group relative flex min-h-[220px] flex-col gap-3 overflow-hidden rounded-[1.5rem] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_var(--accent)] md:rounded-[1.75rem] ${className}`}
      style={{ '--accent': a.main } as CSSProperties}
    >
      <ModuleArt
        module={id}
        className="pointer-events-none absolute -right-2 -top-2 h-32 w-32 opacity-70 transition-transform duration-500 group-hover:scale-105"
      />

      <div className="relative flex items-center gap-2">
        <span
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ background: `color-mix(in srgb, ${a.main} 20%, transparent)`, color: a.soft }}
        >
          <Icon size={18} aria-hidden="true" />
        </span>
        <h3 className="font-display text-base font-semibold text-white">{label}</h3>
      </div>

      <div className="relative flex items-end justify-between gap-3">
        <div>
          <p className="flex items-baseline gap-1.5">
            <span className="num font-display text-4xl font-semibold text-white">{value}</span>
            {unit && <span className="num text-sm text-muted">{unit}</span>}
          </p>
          {delta && (
            <p className={`num mt-1 flex items-center gap-1 text-xs ${delta.good ? 'text-ok' : 'text-orange'}`}>
              <DeltaIcon size={14} aria-hidden="true" />
              <span>{delta.text}</span>
              <span className="text-muted">vs baseline</span>
            </p>
          )}
          {secondary && <div className="mt-1 text-xs text-white/85">{secondary}</div>}
        </div>
        {ring !== undefined && (
          <ProgressRing value={ring} size={92} color={a.main} label={`${label} index`}>
            <span className="num text-lg font-semibold">{Math.round(ring)}</span>
          </ProgressRing>
        )}
      </div>

      <p className="relative text-sm leading-snug text-white/85">{description}</p>

      {spark && spark.length > 1 && (
        <div className="relative mt-auto">
          <Sparkline data={spark} color={a.main} height={40} />
        </div>
      )}

      <div className="relative mt-auto flex flex-wrap items-center justify-between gap-2">
        <span
          className={`font-mono text-[10px] uppercase tracking-wider ${tag === 'Measured' ? 'text-cyan-bright' : 'text-[#ffa275]'}`}
        >
          {tag}
        </span>
        <DemoBadge sim />
      </div>
    </Link>
  )
}
