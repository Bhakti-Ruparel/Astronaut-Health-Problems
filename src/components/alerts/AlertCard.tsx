import { Check, Lightbulb, RotateCcw } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { AlertItem } from '../../types'
import { Planet, type PlanetVariant } from '../art'
import { StatusBadge, type Tone } from '../ui/StatusBadge'

const SEV: Record<
  AlertItem['severity'],
  { tone: Tone; label: string; bar: string; accent: string; planet: PlanetVariant; tint: string }
> = {
  high: { tone: 'attention', label: 'Needs attention', bar: 'bg-red-300', accent: '#f87171', planet: 'gas', tint: 'hue-rotate(150deg) saturate(1.4)' },
  moderate: { tone: 'watch', label: 'Watch', bar: 'bg-orange', accent: '#fc6d26', planet: 'ringed', tint: 'sepia(1) saturate(5) hue-rotate(-25deg) brightness(1.05)' },
  info: { tone: 'info', label: 'Info', bar: 'bg-cyan', accent: '#55c6e8', planet: 'moon', tint: 'hue-rotate(160deg) saturate(2.2)' },
}

export function AlertCard({
  alert,
  onDismiss,
  onRestore,
  compact = false,
}: {
  alert: AlertItem
  onDismiss?: () => void
  onRestore?: () => void
  compact?: boolean
}) {
  const sev = SEV[alert.severity]
  return (
    <article
      className="glass glass-accent fade-in relative overflow-hidden p-5 pl-6"
      style={{ '--accent': sev.accent } as CSSProperties}
      aria-label={alert.title}
    >
      <span className={`absolute top-0 bottom-0 left-0 w-1 ${sev.bar}`} aria-hidden="true" />
      <div className="flex items-start gap-4">
        <div
          className="mt-0.5 h-14 w-14 shrink-0"
          style={{ filter: `${sev.tint} drop-shadow(0 0 10px ${sev.accent})` }}
          aria-hidden="true"
        >
          <Planet variant={sev.planet} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge tone={sev.tone}>{sev.label}</StatusBadge>
            <span className="font-mono text-[10px] tracking-wider text-muted uppercase">
              Monitoring indicator, not a medical diagnosis
            </span>
          </div>
          <h3 className="text-base font-semibold">{alert.title}</h3>
        </div>
      </div>
      {!compact && <p className="mt-3 text-sm text-white/85">{alert.explanation}</p>}
      {!compact && (
        <dl className="mt-3 grid grid-cols-3 gap-2">
          {alert.metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
              <dt className="label-mono">{m.label}</dt>
              <dd className="num mt-0.5 text-sm font-medium">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-3 flex gap-2 rounded-xl bg-void/50 p-3 text-sm">
        <Lightbulb size={18} className="mt-0.5 shrink-0 text-cyan" aria-hidden="true" />
        <p>
          <span className="font-medium text-cyan">Recommended: </span>
          {alert.recommendation}
        </p>
      </div>
      {(onDismiss || onRestore) && (
        <div className="mt-3">
          {onDismiss && (
            <button type="button" onClick={onDismiss} className="btn btn-ghost">
              <Check size={16} aria-hidden="true" /> Acknowledge
            </button>
          )}
          {onRestore && (
            <button type="button" onClick={onRestore} className="btn btn-ghost">
              <RotateCcw size={16} aria-hidden="true" /> Restore
            </button>
          )}
        </div>
      )}
    </article>
  )
}
