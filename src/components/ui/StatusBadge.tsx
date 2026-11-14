import type { ReactNode } from 'react'

export type Tone = 'nominal' | 'watch' | 'attention' | 'info' | 'measured' | 'self'

const TONES: Record<Tone, string> = {
  nominal: 'bg-ok/15 text-ok border-ok/40',
  watch: 'bg-orange/15 text-orange border-orange/40',
  attention: 'bg-red-400/15 text-red-300 border-red-300/40',
  info: 'bg-cyan/15 text-cyan border-cyan/40',
  measured: 'bg-cyan/15 text-cyan border-cyan/50',
  self: 'bg-transparent text-orange border-orange/60',
}

export function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}

export function DemoBadge({ label = 'Simulated demo data' }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded border border-dashed border-muted/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
      {label}
    </span>
  )
}
