import { Rocket } from 'lucide-react'
import type { CSSProperties } from 'react'
import { formatDateTime } from '../../lib/stats'
import type { AssessmentResult } from '../../types'
import { Planet } from '../art/Planet'
import type { MissionInfo } from './missions'

export function MissionCard({
  mission: m,
  last,
  onStart,
}: {
  mission: MissionInfo
  last?: AssessmentResult
  onStart: () => void
}) {
  const Icon = m.icon
  return (
    <article
      className="glass glass-accent fade-in group relative flex flex-col overflow-hidden p-5 transition-[transform,border-color] duration-200 hover:-translate-y-1 md:p-6"
      style={{ '--accent': m.accent.main } as CSSProperties}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-6 -right-6 w-36 opacity-90 transition-transform duration-500 group-hover:scale-105">
        <Planet variant={m.planet} />
      </div>

      <div className="relative">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5"
          style={{ color: m.accent.main, boxShadow: `0 0 20px ${m.accent.glow}` }}
        >
          <Icon size={22} aria-hidden="true" />
        </span>
        <p className="label-mono mt-4" style={{ color: m.accent.soft }}>
          Mission: {m.mission}
        </p>
        <h2 className="font-display text-xl font-bold text-white">{m.title}</h2>
        <p className="mt-0.5 text-xs text-muted">{m.measures}</p>
        <p className="mt-3 text-sm text-white/85">{m.desc}</p>
      </div>

      <div className="relative mt-5 flex flex-1 items-end justify-between gap-3 border-t border-white/10 pt-4 text-xs text-muted">
        {last ? (
          <span>
            Last score <span className="num text-base font-semibold text-white">{last.score}</span>
            <span className="block">{formatDateTime(last.timestamp)}</span>
          </span>
        ) : (
          <span>No sessions yet</span>
        )}
        <span className="num shrink-0">{m.duration}</span>
      </div>

      <button
        type="button"
        className="btn btn-primary relative mt-4 shadow-[0_0_28px_rgb(85_198_232/0.35)]"
        onClick={onStart}
      >
        <Rocket size={16} aria-hidden="true" /> Start mission
        <span className="sr-only">: {m.title}</span>
      </button>
    </article>
  )
}
