import { lazy, Suspense, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyArt } from '../components/art/EmptyArt'
import { MissionCard } from '../components/assessment/MissionCard'
import { MISSIONS, missionFor } from '../components/assessment/missions'
import { TestStage } from '../components/assessment/TestStage'
import { EmptyState } from '../components/ui/EmptyState'
import { DemoBadge } from '../components/ui/StatusBadge'
import { formatDateTime, ofType } from '../lib/stats'
import { useApp } from '../store/AppStore'
import type { AssessmentResult, AssessmentType, GameResult } from '../types'

const Brain = lazy(() => import('../components/art/Brain').then((m) => ({ default: m.Brain })))

const isType = (v: string | null): v is AssessmentType => v === 'reaction' || v === 'memory' || v === 'attention'

export function AssessmentPage() {
  const { assessments, baseline, addAssessment } = useApp()
  const [params, setParams] = useSearchParams()
  const initial = params.get('test')
  const [active, setActive] = useState<AssessmentType | null>(isType(initial) ? initial : null)
  const [runKey, setRunKey] = useState(0)
  const [retrying, setRetrying] = useState(false)
  const [outcome, setOutcome] = useState<{ result: AssessmentResult; previous?: AssessmentResult } | null>(null)
  const latest = useRef(assessments)
  latest.current = assessments

  const launch = (t: AssessmentType, retry = false) => {
    setOutcome(null)
    setRetrying(retry)
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

  const recent = [...assessments].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 6)

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="deck-title"
        className="glass relative isolate overflow-hidden rounded-[2rem] p-6 md:p-10"
        style={{ background: 'linear-gradient(135deg, rgb(11 20 48 / .9), rgb(42 45 110 / .7) 60%, rgb(59 31 122 / .6))' }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute -top-4 -right-4 -z-10 w-64 opacity-70 md:right-6 md:w-96">
          <Suspense fallback={<div className="aspect-square w-full rounded-full bg-violet/20" />}>
            <Brain />
          </Suspense>
        </div>
        <p className="label-mono text-cyan-bright">Mission training deck</p>
        <h1 id="deck-title" className="mt-1 font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
          Cognitive assessments
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/85 md:text-base">
          Short, playable missions that test reaction speed, memory and attention. Results are saved locally and feed
          your trends and alerts. Monitoring indicators, not medical diagnoses.
        </p>
        <div className="mt-4">
          <DemoBadge />
        </div>
      </section>

      <section aria-label="Available missions" className="grid gap-4 md:grid-cols-3 md:gap-6">
        {MISSIONS.map((m) => (
          <MissionCard key={m.type} mission={m} last={ofType(assessments, m.type).at(-1)} onStart={() => launch(m.type)} />
        ))}
      </section>

      <section aria-labelledby="recent-title">
        <h2 id="recent-title" className="mb-3 font-display text-xl font-semibold text-white">
          Recent sessions
        </h2>
        {recent.length === 0 ? (
          <EmptyState
            art={<EmptyArt scene="no-assessments" />}
            title="No assessments yet"
            body="Launch a mission above to record your first session."
          />
        ) : (
          <ul className="glass divide-y divide-white/10 p-1">
            {recent.map((r) => {
              const m = missionFor(r.type)
              return (
                <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: m.accent.main, boxShadow: `0 0 10px ${m.accent.glow}` }}
                      aria-hidden="true"
                    />
                    <span className="text-white">{m.title}</span>
                    <span className="hidden text-muted sm:inline">{r.source === 'seed' ? 'Simulated' : 'You'}</span>
                  </span>
                  <span className="flex items-center gap-4 text-muted">
                    <span className="num hidden sm:inline">{formatDateTime(r.timestamp)}</span>
                    <span>
                      Score <span className="num text-base font-semibold text-white">{r.score}</span>
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {active && (
        <TestStage
          key={runKey}
          type={active}
          startAt={retrying ? 'countdown' : 'instructions'}
          outcome={outcome}
          baseline={baseline}
          onComplete={complete}
          onAbort={back}
          onRetry={() => launch(active, true)}
        />
      )}
    </div>
  )
}
