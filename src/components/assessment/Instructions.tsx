import { ArrowLeft, Keyboard, Rocket } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { AssessmentType } from '../../types'
import { missionFor } from './missions'

export function Instructions({
  type,
  onBegin,
  onBack,
}: {
  type: AssessmentType
  onBegin: () => void
  onBack: () => void
}) {
  const m = missionFor(type)
  const Icon = m.icon
  return (
    <section className="glass-strong glass-accent mx-auto w-full max-w-2xl p-6 md:p-9" style={{ '--accent': m.accent.main } as CSSProperties}>
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5"
          style={{ color: m.accent.main, boxShadow: `0 0 24px ${m.accent.glow}` }}
        >
          <Icon size={24} aria-hidden="true" />
        </span>
        <div>
          <p className="label-mono" style={{ color: m.accent.soft }}>
            Mission: {m.mission}
          </p>
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">{m.title}</h2>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">{m.desc}</p>

      <ol className="mt-6 space-y-3">
        {m.steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
              style={{ borderColor: m.accent.main, color: m.accent.soft, background: 'rgb(255 255 255 / 0.06)' }}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="pt-1 text-sm text-white/90 md:text-base">
              <span className="sr-only">Step {i + 1}: </span>
              {s}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted">
        <Keyboard size={18} aria-hidden="true" className="shrink-0 text-cyan-bright" />
        <span>
          <span className="text-white">Controls: </span>
          {m.controls} Press Esc to abort the mission.
        </span>
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" onClick={onBegin} autoFocus>
          <Rocket size={16} aria-hidden="true" /> Begin countdown
        </button>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </button>
      </div>
      <p className="mt-4 text-xs text-muted">Monitoring indicators, not medical diagnoses.</p>
    </section>
  )
}
