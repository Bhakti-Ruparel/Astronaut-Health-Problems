import { ArrowDown, ArrowLeft, ArrowUp, CheckCircle2, Minus, RotateCcw } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { pctDelta, round1 } from '../../lib/stats'
import type { AssessmentResult, AssessmentType, Baseline } from '../../types'
import { missionFor } from '../assessment/missions'
import { ProgressRing } from '../ui/ProgressRing'

const INFO: Record<AssessmentType, { title: string; measures: string; formula: string }> = {
  reaction: {
    title: 'Reaction Time Test',
    measures:
      'Reaction time reflects processing speed and alertness: how quickly you detect a signal and respond. It naturally varies with sleep, workload and time of day, so what matters is the pattern compared with your own baseline.',
    formula: 'Score = (600 − average ms) ÷ 4, limited to 0-100 (200 ms = 100, 600 ms = 0).',
  },
  memory: {
    title: 'Memory Test',
    measures:
      'This measures short-term working memory: holding a sequence in mind and reproducing it in order. Accuracy is the share of digits entered in the correct position across all rounds.',
    formula: 'Score = 70% accuracy + 30% longest sequence recalled perfectly (8 digits = full marks).',
  },
  attention: {
    title: 'Attention Test',
    measures:
      'This measures sustained attention and impulse control: noticing rare targets in a steady stream while avoiding responses to non-targets.',
    formula: 'Score = hit rate (%) minus 15 points per false alarm, limited to 0-100.',
  },
}

function primary(r: AssessmentResult): { label: string; value: number; unit: string; lowerBetter: boolean } {
  if (r.type === 'reaction') return { label: 'Average reaction time', value: r.reactionMs ?? 0, unit: 'ms', lowerBetter: true }
  if (r.type === 'memory') return { label: 'Recall accuracy', value: r.accuracy ?? 0, unit: '%', lowerBetter: false }
  return { label: 'Attention score', value: r.score, unit: '', lowerBetter: false }
}

function baselineFor(type: AssessmentType, b: Baseline) {
  return type === 'reaction' ? b.reactionMs : type === 'memory' ? b.memoryAccuracy : b.attentionScore
}

function Comparison({
  title,
  current,
  reference,
  unit,
  lowerBetter,
  emptyText,
}: {
  title: string
  current: number
  reference: number | undefined
  unit: string
  lowerBetter: boolean
  emptyText?: string
}) {
  if (reference === undefined) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="label-mono">{title}</div>
        <p className="mt-1 text-sm text-muted">{emptyText ?? 'No earlier result.'}</p>
      </div>
    )
  }
  const diff = current - reference
  const pct = pctDelta(current, reference)
  const better = lowerBetter ? diff < 0 : diff > 0
  const same = Math.abs(pct) < 1
  const sign = diff > 0 ? '+' : ''
  const Arrow = same ? Minus : diff > 0 ? ArrowUp : ArrowDown
  const tone = same ? 'text-muted' : better ? 'text-ok' : 'text-orange'
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="label-mono">{title}</div>
      <div className="num mt-1 font-display text-2xl font-semibold">
        {round1(reference)}
        {unit && <span className="text-sm font-normal text-muted"> {unit}</span>}
      </div>
      <div className={`num mt-1 flex items-start gap-1.5 text-sm ${tone}`}>
        <Arrow size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
        <span>
          {sign}
          {round1(diff)} {unit} ({sign}
          {round1(pct)}%) · {same ? 'about the same' : better ? 'better' : 'lower than reference'}
        </span>
      </div>
    </div>
  )
}

/** Counts up to `target` over ~900 ms; returns the target immediately for reduced-motion users. */
function useCountUp(target: number, reduced: boolean) {
  const [v, setV] = useState(reduced ? target : 0)
  useEffect(() => {
    if (reduced) {
      setV(target)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 900)
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, reduced])
  return v
}

export function ResultPanel({
  result,
  previous,
  baseline,
  onRetry,
  onBack,
}: {
  result: AssessmentResult
  previous?: AssessmentResult
  baseline: Baseline
  onRetry: () => void
  onBack: () => void
}) {
  const info = INFO[result.type]
  const m = missionFor(result.type)
  const p = primary(result)
  const prevP = previous ? primary(previous).value : undefined
  const reduced = useReducedMotion()
  const shown = useCountUp(result.score, reduced)

  return (
    <section
      className="glass-strong glass-accent fade-in mx-auto w-full max-w-3xl p-5 md:p-8"
      style={{ '--accent': m.accent.main } as CSSProperties}
      aria-label={`${info.title} results`}
    >
      <p className="label-mono" style={{ color: m.accent.soft }}>
        Mission complete: {m.mission}
      </p>
      <h2 className="font-display text-2xl font-bold text-white md:text-3xl">{info.title}: results</h2>
      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-ok/40 bg-ok/10 px-3 py-1 text-xs text-ok">
        <CheckCircle2 size={14} aria-hidden="true" /> Saved to your history
      </p>
      <p className="mt-2 text-xs text-muted">Monitoring indicator, not a medical diagnosis.</p>

      <div className="mt-6 flex flex-col items-center gap-6 md:flex-row md:items-center">
        <div className="relative" style={{ filter: `drop-shadow(0 0 22px ${m.accent.glow})` }}>
          <ProgressRing value={reduced ? result.score : shown} size={176} color={m.accent.main} label="Score">
            <span className="num font-display text-5xl font-bold text-white" aria-hidden="true">
              {shown}
            </span>
            <span className="label-mono">score</span>
          </ProgressRing>
        </div>
        <div className="grid w-full flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label={p.label} value={`${round1(p.value)}${p.unit ? ' ' + p.unit : ''}`} />
          {result.type === 'reaction' && (
            <>
              <Stat label="Best trial" value={`${result.bestMs} ms`} />
              <Stat label="Early taps" value={String(result.prematureCount ?? 0)} />
            </>
          )}
          {result.type === 'memory' && (
            <>
              <Stat label="Longest perfect recall" value={`${result.maxLength ?? 0} digits`} />
              <Stat label="Recall time" value={`${round1((result.completionMs ?? 0) / 1000)} s`} />
            </>
          )}
          {result.type === 'attention' && (
            <>
              <Stat label="Hits" value={`${result.hits} / ${result.targets}`} />
              <Stat label="Misses" value={String(result.misses)} />
              <Stat label="False alarms" value={String(result.falseAlarms)} />
              {result.meanHitMs !== undefined && <Stat label="Mean hit time" value={`${result.meanHitMs} ms`} />}
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Comparison
          title={`Previous ${result.type} result`}
          current={p.value}
          reference={prevP}
          unit={p.unit}
          lowerBetter={p.lowerBetter}
          emptyText="This is your first session of this test."
        />
        <Comparison
          title="Personal baseline"
          current={p.value}
          reference={baselineFor(result.type, baseline)}
          unit={p.unit}
          lowerBetter={p.lowerBetter}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-cyan/25 bg-white/5 p-4">
        <h3 className="font-display text-sm font-semibold text-cyan-bright">What this measures</h3>
        <p className="mt-1 text-sm text-white/90">{info.measures}</p>
        <p className="num mt-2 text-xs text-muted">{info.formula}</p>
        <p className="mt-2 text-xs text-muted">
          A single session is a snapshot. It is a monitoring indicator, not a medical diagnosis.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={onRetry} autoFocus>
          <RotateCcw size={16} aria-hidden="true" /> Run again
        </button>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to missions
        </button>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="label-mono">{label}</div>
      <div className="num mt-1 font-display text-xl font-semibold">{value}</div>
    </div>
  )
}
