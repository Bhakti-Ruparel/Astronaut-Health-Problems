import { Check, Lightbulb, RotateCcw } from 'lucide-react'
import type { AlertItem } from '../../types'
import { StatusBadge, type Tone } from '../ui/StatusBadge'

const SEV: Record<AlertItem['severity'], { tone: Tone; label: string; bar: string }> = {
  high: { tone: 'attention', label: 'Needs attention', bar: 'bg-red-300' },
  moderate: { tone: 'watch', label: 'Watch', bar: 'bg-orange' },
  info: { tone: 'info', label: 'Info', bar: 'bg-cyan' },
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
    <article className="panel fade-in relative overflow-hidden p-4 pl-5" aria-label={alert.title}>
      <span className={`absolute top-0 bottom-0 left-0 w-1 ${sev.bar}`} aria-hidden="true" />
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge tone={sev.tone}>{sev.label}</StatusBadge>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Monitoring indicator, not a medical diagnosis
        </span>
      </div>
      <h3 className="text-base font-semibold">{alert.title}</h3>
      {!compact && <p className="mt-1 text-sm text-white/85">{alert.explanation}</p>}
      {!compact && (
        <dl className="mt-3 grid grid-cols-3 gap-2">
          {alert.metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-white/10 bg-navy/60 p-2">
              <dt className="label-mono">{m.label}</dt>
              <dd className="font-mono text-sm">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-3 flex gap-2 rounded-lg bg-navy/60 p-3 text-sm">
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
