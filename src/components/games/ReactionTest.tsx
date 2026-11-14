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
}: {
  onComplete: (r: GameResult) => void
  onCancel: () => void
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

  const styles: Record<Phase, string> = {
    intro: 'border-cyan/40 bg-navy',
    waiting: 'border-orange bg-navy',
    go: 'border-ok bg-ok text-navy',
    tooSoon: 'border-red-300 bg-red-400/20',
    result: 'border-cyan bg-navy',
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
      progress={phase === 'intro' ? `${TRIALS} trials` : `Trial ${Math.min(trial, TRIALS)} of ${TRIALS} · early taps: ${premature}`}
      onCancel={() => {
        timers.clear()
        onCancel()
      }}
      status={text[phase]}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Reaction arena. Click or press Space or Enter when it turns green."
        onPointerDown={(e) => {
          e.preventDefault()
          handleInput()
        }}
        className={`flex h-72 cursor-pointer select-none items-center justify-center rounded-xl border-2 px-6 text-center font-mono text-2xl font-medium transition-colors ${styles[phase]}`}
      >
        {text[phase]}
      </div>
      <p className="mt-3 text-sm text-muted">
        When the arena turns green, click it or press Space as fast as you can. Tapping early restarts the trial.
      </p>
    </GameFrame>
  )
}
