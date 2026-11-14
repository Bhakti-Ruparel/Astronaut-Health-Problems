import { Delete } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { memoryScore } from '../../lib/scoring'
import type { GameResult } from '../../types'
import { GameFrame } from './GameFrame'
import { useTimers } from './useTimers'

type Phase = 'intro' | 'show' | 'recall' | 'feedback'
const LENGTHS = [4, 5, 6, 7, 8]
const SHOW_MS = 700
const STEP_MS = 950

function makeSequence(len: number): string {
  return Array.from({ length: len }, () => String(Math.floor(Math.random() * 10))).join('')
}

export function MemoryTest({
  onComplete,
  onCancel,
  autoStart = false,
}: {
  onComplete: (r: GameResult) => void
  onCancel: () => void
  /** Skip the intro and start round 1 immediately (used after the mission countdown). */
  autoStart?: boolean
}) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(0)
  const [sequence, setSequence] = useState('')
  const [shownIdx, setShownIdx] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const timers = useTimers()
  const recallStart = useRef(0)
  const totals = useRef({ correct: 0, positions: 0, timeMs: 0, maxLen: 0 })

  const startRound = (r: number) => {
    const seq = makeSequence(LENGTHS[r])
    setRound(r)
    setSequence(seq)
    setInput('')
    setLastCorrect(null)
    setPhase('show')
    seq.split('').forEach((_, i) => {
      timers.set(() => setShownIdx(i), 500 + i * STEP_MS)
      timers.set(() => setShownIdx(null), 500 + i * STEP_MS + SHOW_MS)
    })
    timers.set(() => {
      recallStart.current = performance.now()
      setPhase('recall')
    }, 500 + seq.length * STEP_MS)
  }

  const submit = (value: string) => {
    const elapsed = performance.now() - recallStart.current
    let correct = 0
    for (let i = 0; i < sequence.length; i++) if (value[i] === sequence[i]) correct++
    const exact = value === sequence
    const t = totals.current
    t.correct += correct
    t.positions += sequence.length
    t.timeMs += elapsed
    if (exact) t.maxLen = Math.max(t.maxLen, sequence.length)
    setLastCorrect(exact)
    setPhase('feedback')
    timers.set(() => {
      if (round + 1 >= LENGTHS.length) {
        const accuracy = Math.round((t.correct / t.positions) * 1000) / 10
        onComplete({
          type: 'memory',
          accuracy,
          maxLength: t.maxLen,
          completionMs: Math.round(t.timeMs),
          score: memoryScore(accuracy, t.maxLen),
        })
      } else {
        startRound(round + 1)
      }
    }, 1500)
  }

  const press = (d: string) => {
    if (phase !== 'recall' || input.length >= sequence.length) return
    const next = input + d
    setInput(next)
    if (next.length === sequence.length) submit(next)
  }
  const back = () => phase === 'recall' && setInput((v) => v.slice(0, -1))

  const pressRef = useRef(press)
  pressRef.current = press
  const backRef = useRef(back)
  backRef.current = back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) pressRef.current(e.key)
      else if (e.key === 'Backspace') backRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // One-time start. The ref is reset on cleanup so a StrictMode remount (which clears timers) restarts cleanly.
  const started = useRef(false)
  useEffect(() => {
    if (!autoStart || started.current) return
    started.current = true
    startRound(0)
    return () => {
      started.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart])

  const status =
    phase === 'show'
      ? 'Memorize the sequence'
      : phase === 'recall'
        ? `Enter the ${sequence.length} digits`
        : phase === 'feedback'
          ? lastCorrect
            ? 'Correct'
            : `Not quite. The sequence was ${sequence}`
          : ''

  return (
    <GameFrame
      title="Memory Test"
      progress={phase === 'intro' ? `${LENGTHS.length} rounds, 4 to 8 digits` : `Round ${round + 1} of ${LENGTHS.length} · ${sequence.length} digits`}
      onCancel={() => {
        timers.clear()
        onCancel()
      }}
      status={status}
      current={round + 1}
      total={LENGTHS.length}
    >
      <div
        className={`glass flex h-48 flex-col items-center justify-center rounded-3xl border-2 text-center transition-[border-color,box-shadow] duration-200 ${
          phase === 'feedback'
            ? lastCorrect
              ? 'border-ok/70 shadow-[0_0_50px_-8px_rgb(74_222_128/0.5)]'
              : 'border-orange/70 shadow-[0_0_50px_-8px_rgb(252_109_38/0.5)]'
            : phase === 'show'
              ? 'border-violet/50'
              : 'border-white/15'
        }`}
      >
        {phase === 'intro' && !autoStart && (
          <button type="button" className="btn btn-primary" onClick={() => startRound(0)} autoFocus>
            Start memory test
          </button>
        )}
        {phase === 'show' && (
          <div
            className={`num flex h-32 w-28 items-center justify-center rounded-3xl border-2 font-display text-7xl font-semibold transition-[background-color,border-color,box-shadow,color] duration-150 ${
              shownIdx !== null
                ? 'border-violet-soft bg-violet/25 text-white shadow-[0_0_50px_6px_rgb(139_92_246/0.5)]'
                : 'border-white/15 bg-white/5 text-muted'
            }`}
            aria-hidden="true"
          >
            {shownIdx !== null ? sequence[shownIdx] : '·'}
          </div>
        )}
        {phase === 'recall' && (
          <div className="flex flex-wrap justify-center gap-2 px-2" aria-label={`Entered ${input.length} of ${sequence.length}`}>
            {Array.from({ length: sequence.length }, (_, i) => (
              <span
                key={i}
                className={`num flex h-14 w-10 items-center justify-center rounded-xl border font-display text-3xl transition-[background-color,border-color,box-shadow] duration-150 ${
                  i < input.length
                    ? 'border-cyan bg-cyan/15 text-white shadow-[0_0_16px_rgb(85_198_232/0.55)]'
                    : i === input.length
                      ? 'border-violet-soft/70 bg-white/5 text-muted'
                      : 'border-white/20 bg-white/5 text-muted'
                }`}
              >
                {input[i] ?? ''}
              </span>
            ))}
          </div>
        )}
        {phase === 'feedback' && (
          <div>
            <p className={`font-display text-xl font-semibold ${lastCorrect ? 'text-ok' : 'text-orange'}`}>
              {lastCorrect ? 'Correct' : 'Not quite'}
            </p>
            <p className="num mt-1 font-display text-2xl tracking-[0.3em]">{sequence}</p>
          </div>
        )}
      </div>

      <div
        className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2 sm:max-w-md sm:grid-cols-5"
        role="group"
        aria-label="Digit pad"
      >
        {'1234567890'.split('').map((d) => (
          <button
            key={d}
            type="button"
            disabled={phase !== 'recall'}
            onClick={() => press(d)}
            className="num glass h-12 rounded-2xl font-display text-lg font-medium text-white transition-[border-color,box-shadow,transform,opacity] hover:border-cyan hover:text-cyan-bright hover:shadow-[0_0_18px_rgb(85_198_232/0.4)] active:scale-95 disabled:opacity-40 disabled:hover:shadow-none"
          >
            {d}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-center">
        <button
          type="button"
          disabled={phase !== 'recall' || input.length === 0}
          onClick={back}
          className="btn btn-ghost disabled:opacity-40"
          aria-label="Backspace"
        >
          <Delete size={16} aria-hidden="true" /> Backspace
        </button>
      </div>
      <p className="mt-3 text-center text-sm text-muted">
        Watch each digit, then type the sequence from memory using the pad or your keyboard.
      </p>
    </GameFrame>
  )
}
