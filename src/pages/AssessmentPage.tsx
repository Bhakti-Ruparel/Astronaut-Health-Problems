import { Brain, Crosshair, Timer, type LucideIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AttentionTest } from '../components/games/AttentionTest'
import { MemoryTest } from '../components/games/MemoryTest'
import { ReactionTest } from '../components/games/ReactionTest'
import { ResultPanel } from '../components/games/ResultPanel'
import { PageTitle } from '../components/ui/controls'
import { formatDateTime, ofType } from '../lib/stats'
import { useApp } from '../store/AppStore'
import type { AssessmentResult, AssessmentType, GameResult } from '../types'

const TESTS: { type: AssessmentType; title: string; icon: LucideIcon; duration: string; desc: string; measures: string }[] = [
  {
    type: 'reaction',
    title: 'Reaction Time',
    icon: Timer,
    duration: '~1 min',
    desc: 'Wait for the arena to turn green, then react as fast as you can. Five trials.',
    measures: 'Processing speed and alertness',
  },
  {
    type: 'memory',
    title: 'Memory',
    icon: Brain,
    duration: '~2 min',
    desc: 'Watch a digit sequence, then type it from memory. Five rounds, 4 to 8 digits.',
    measures: 'Working memory',
  },
  {
    type: 'attention',
    title: 'Attention',
    icon: Crosshair,
    duration: '~40 s',
    desc: 'Respond only to the triangle target in a stream of 36 symbols.',
    measures: 'Sustained attention and impulse control',
  },
]

const isType = (v: string | null): v is AssessmentType => v === 'reaction' || v === 'memory' || v === 'attention'

export function AssessmentPage() {
  const { assessments, baseline, addAssessment } = useApp()
  const [params, setParams] = useSearchParams()
  const initial = params.get('test')
  const [active, setActive] = useState<AssessmentType | null>(isType(initial) ? initial : null)
  const [runKey, setRunKey] = useState(0)
  const [outcome, setOutcome] = useState<{ result: AssessmentResult; previous?: AssessmentResult } | null>(null)
  const latest = useRef(assessments)
  latest.current = assessments

  const launch = (t: AssessmentType) => {
    setOutcome(null)
    setActive(t)
    setRunKey((k) => k + 1)
  }
  const back = () => {
    setActive(null)
    setOutcome(null)
    if (params.has('test')) setParams({}, { replace: true })
  }

  const complete = (g: GameResult) => {
    const previous = ofType(latest.current, g.type).at(-1)
    const result = addAssessment(g)
    setOutcome({ result, previous })
  }

  return (
    <div>
      <PageTitle
        title="Cognitive Assessment"
        subtitle="Short, playable tests of reaction speed, memory and attention. Results are saved locally and feed your trends and alerts. Monitoring indicators, not medical diagnoses."
      />

      {active && outcome && (
        <ResultPanel
          result={outcome.result}
          previous={outcome.previous}
          baseline={baseline}
          onRetry={() => launch(active)}
          onBack={back}
        />
      )}

      {active && !outcome && (
        <div key={runKey}>
          {active === 'reaction' && <ReactionTest onComplete={complete} onCancel={back} />}
          {active === 'memory' && <MemoryTest onComplete={complete} onCancel={back} />}
          {active === 'attention' && <AttentionTest onComplete={complete} onCancel={back} />}
        </div>
      )}

      {!active && (
        <div className="grid gap-4 md:grid-cols-3">
          {TESTS.map((t) => {
            const last = ofType(assessments, t.type).at(-1)
            const Icon = t.icon
            return (
              <article key={t.type} className="panel fade-in flex flex-col p-5 transition-colors hover:border-cyan/50">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-cyan">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className="label-mono">{t.duration}</span>
                </div>
                <h2 className="text-lg font-semibold">{t.title} Test</h2>
                <p className="label-mono mt-0.5 normal-case tracking-normal">{t.measures}</p>
                <p className="mt-3 flex-1 text-sm text-white/85">{t.desc}</p>
                <div className="mt-4 border-t border-white/10 pt-3 font-mono text-xs text-muted">
                  {last ? (
                    <>
                      Last score <span className="text-white">{last.score}</span> · {formatDateTime(last.timestamp)}
                    </>
                  ) : (
                    'No sessions yet'
                  )}
                </div>
                <button type="button" className="btn btn-primary mt-4" onClick={() => launch(t.type)}>
                  Start {t.title.toLowerCase()} test
                </button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
