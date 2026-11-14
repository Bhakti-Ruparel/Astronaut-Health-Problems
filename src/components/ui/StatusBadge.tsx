import type { ReactNode } from 'react'

export type Tone = 'nominal' | 'watch' | 'attention' | 'info' | 'measured' | 'self'

const TONES: Record<Tone, { cls: string; dot: string }> = {
  nominal: { cls: 'bg-ok/15 text-[#86efac] border-ok/40', dot: 'bg-ok' },
  watch: { cls: 'bg-orange/15 text-[#ffb38f] border-orange/40', dot: 'bg-orange' },
  attention: { cls: 'bg-red-400/15 text-red-200 border-red-300/40', dot: 'bg-red-300' },
  info: { cls: 'bg-cyan/15 text-cyan-bright border-cyan/40', dot: 'bg-cyan' },
  measured: { cls: 'bg-cyan/15 text-cyan-bright border-cyan/50', dot: 'bg-cyan' },
  self: { cls: 'bg-orange/5 text-[#ffb38f] border-orange/60', dot: 'bg-orange' },
}

export function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  const t = TONES[tone]
  return (
    <span className={`badge ${t.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
      {children}
    </span>
  )
}

export function DemoBadge({
  label = 'Simulated demo data',
  sim = false,
}: {
  label?: string
  /** Tiny corner-label variant for module cards. */
  sim?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-dashed border-muted/60 uppercase text-muted ${
        sim ? 'bg-void/40 px-1.5 py-px text-[9px] tracking-wide' : 'px-2.5 py-0.5 text-[10px] tracking-wider'
      } font-mono`}
    >
      {label}
    </span>
  )
}
