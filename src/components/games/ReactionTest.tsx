import { useEffect, useRef, useState } from 'react'
import { mean } from '../../lib/stats'
import { reactionScore } from '../../lib/scoring'
import type { GameResult } from '../../types'
import { GameFrame } from './GameFrame'
import { useTimers } from './useTimers'

type Phase = 'intro' | 'waiting' | 'go' | 'tooSoon' | 'result'
const TRIALS = 5

export function ReactionTest({
  onComplete,
  onCancel,
  autoStart = false,
}: {
  onComplete: (r: GameResult) => void
  onCancel: () => void
  /** Skip the intro and start the first trial immediately (used after the mission countdown). */
  autoStart?: boolean
}) {
  const [phase, setPhaseState] = useState<Phase>('intro')
  const [trial, setTrial] = useState(1)
  const [lastMs, setLastMs] = useState<number | null>(null)
  const [premature, setPremature] = useState(0)
  const phaseRef = useRef<Phase>('intro')
  const times = useRef<number[]>([])
  const prem = useRef(0)
  const goAt = useRef(0)
  const timers = useTimers()

  const setPhase = (p: Phase) => {
    phaseRef.current = p
    setPhaseState(p)
  }

  const startTrial = () => {
    setPhase('waiting')
    timers.set(() => {
      goAt.current = performance.now()
      setPhase('go')
    }, 1500 + Math.random() * 2500)
  }

  const handleInput = () => {
    const p = phaseRef.current
    if (p === 'intro') {
      startTrial()
    } else if (p === 'waiting') {
      timers.clear()
      prem.current += 1
      setPremature(prem.current)
      setPhase('tooSoon')
      timers.set(startTrial, 1200)
    } else if (p === 'go') {
      const ms = performance.now() - goAt.current
      times.current.push(ms)
      setLastMs(ms)
      if (times.current.length >= TRIALS) {
        const avg = mean(times.current)
        setPhase('result')
        timers.set(
          () =>
            onComplete({
              type: 'reaction',
              reactionMs: Math.round(avg),
              bestMs: Math.round(Math.min(...times.current)),
              prematureCount: prem.current,
              score: reactionScore(avg),
            }),
          700,
        )
      } else {
        setPhase('result')
        timers.set(() => {
          setTrial(times.current.length + 1)
          startTrial()
        }, 900)
      }
    }
  }

  const inputRef = useRef(handleInput)
  inputRef.current = handleInput

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return
      if (e.target instanceof HTMLButtonElement) return
      e.preventDefault()
      if (e.repeat) return
      inputRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // One-time start. The ref is reset on cleanup so a StrictMode remount (which clears timers) restarts cleanly.
  const started = useRef(false)
  useEffect(() => {
    if (!autoStart || started.current) return
    started.current = true
    startTrial()
    return () => {
      started.current = false
    }
  }, [autoStart])

  // Visual-only phase: avoid flashing the intro prompt for the single frame before autoStart fires.
  const view: Phase = autoStart && phase === 'intro' ? 'waiting' : phase
  const arena: Record<Phase, string> = {
    intro: 'border-cyan/40',
    waiting: 'border-violet/40',
    go: 'border-ok/70 shadow-[0_0_60px_-10px_rgb(74_222_128/0.55)]',
    tooSoon: 'border-red-300/70 bg-red-500/10 shake',
    result: 'border-cyan/50',
  }
  const beacon: Record<Phase, string> = {
    intro: 'border-cyan/50 bg-linear-to-br from-indigo to-midnight text-cyan-bright',
    waiting: 'border-violet/50 bg-linear-to-br from-indigo/70 to-void text-violet-soft',
    go: 'border-white/70 bg-linear-to-br from-cyan-bright via-ok to-cyan text-void shadow-[0_0_70px_14px_rgb(74_222_128/0.55)]',
    tooSoon: 'border-red-300 bg-linear-to-br from-pink to-red-500 text-white shadow-[0_0_60px_10px_rgb(248_113_113/0.5)]',
    result: 'border-cyan bg-linear-to-br from-indigo to-midnight text-white shadow-[0_0_50px_6px_rgb(85_198_232/0.4)]',
  }
  const text: Record<Phase, string> = {
    intro: 'Click here or press Space to begin',
    waiting: 'Wait for green…',
    go: 'TAP NOW!',
    tooSoon: 'Too soon! Wait for green. Restarting this trial…',
    result: lastMs !== null ? `${Math.round(lastMs)} ms` : '',
  }

  return (
    <GameFrame
      title="Reaction Time Test"
      progress={view === 'intro' ? `${TRIALS} trials` : `Trial ${Math.min(trial, TRIALS)} of ${TRIALS} · early taps: ${premature}`}
      onCancel={() => {
        timers.clear()
        onCancel()
      }}
      status={text[phase]}
      current={Math.min(trial, TRIALS)}
      total={TRIALS}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Reaction arena. Click or press Space or Enter when it turns green."
        onPointerDown={(e) => {
          e.preventDefault()
          handleInput()
        }}
        className={`glass relative flex h-80 cursor-pointer select-none flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border-2 px-6 text-center transition-[border-color,box-shadow,background-color] duration-200 ${arena[view]}`}
      >
        <div className="relative flex h-44 w-44 items-center justify-center md:h-52 md:w-52">
          {view === 'waiting' && (
            <span
              aria-hidden="true"
              className="pulse-ring absolute inset-0 rounded-full border-2 border-orange/80 motion-reduce:opacity-60"
            />
          )}
          {view === 'go' && (
            <>
              <span aria-hidden="true" className="pulse-ring absolute inset-0 rounded-full border-2 border-ok motion-reduce:hidden" />
              <span
                aria-hidden="true"
                className="pulse-ring absolute inset-0 rounded-full border-2 border-cyan-bright motion-reduce:hidden"
                style={{ animationDelay: '0.8s' }}
              />
              <span
                aria-hidden="true"
                className="pulse-ring absolute inset-0 rounded-full border-2 border-white/70 motion-reduce:hidden"
                style={{ animationDelay: '1.6s' }}
              />
            </>
          )}
          <div
            className={`relative flex h-36 w-36 items-center justify-center rounded-full border-2 transition-[background-color,box-shadow,border-color] duration-150 md:h-44 md:w-44 ${beacon[view]}`}
          >
            <span aria-hidden="true" className="absolute top-3 left-5 h-6 w-12 -rotate-24 rounded-full bg-white/20 blur-[2px]" />
            {view === 'go' && <span className="font-display text-2xl font-bold">{text.go}</span>}
            {view === 'result' && <span className="num font-display text-3xl font-bold">{text.result}</span>}
          </div>
        </div>
        {view === 'go' || view === 'result' ? (
          <span className="h-7" aria-hidden="true" />
        ) : (
          <span
            className={`font-display text-lg font-medium md:text-xl ${view === 'tooSoon' ? 'text-red-200' : 'text-white'}`}
          >
            {text[view]}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-muted">
        When the arena turns green, click it or press Space as fast as you can. Tapping early restarts the trial.
      </p>
    </GameFrame>
  )
}
