import { useEffect, useRef, useState } from 'react'
import { attentionScore } from '../../lib/scoring'
import { mean } from '../../lib/stats'
import type { GameResult } from '../../types'
import { GameFrame } from './GameFrame'
import { useTimers } from './useTimers'

const TARGET = '▲'
const DISTRACTORS = ['●', '■', '◆', '★', '✚']
const ITEMS = 36
const TARGET_COUNT = 11
const ITEM_MS = 1000
const VISIBLE_MS = 900

function buildStream(): string[] {
  const idx = Array.from({ length: ITEMS }, (_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  const targets = new Set(idx.slice(0, TARGET_COUNT))
  return Array.from({ length: ITEMS }, (_, i) =>
    targets.has(i) ? TARGET : DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)],
  )
}

type Phase = 'intro' | 'running'

export function AttentionTest({
  onComplete,
  onCancel,
  autoStart = false,
}: {
  onComplete: (r: GameResult) => void
  onCancel: () => void
  /** Skip the intro and start the symbol stream immediately (used after the mission countdown). */
  autoStart?: boolean
}) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(false)
  const [flash, setFlash] = useState<'hit' | 'false' | null>(null)
  const [counts, setCounts] = useState({ hits: 0, fa: 0 })
  const timers = useTimers()
  const stream = useRef<string[]>([])
  const cur = useRef(-1)
  const responded = useRef(false)
  const shownAt = useRef(0)
  const stats = useRef({ hits: 0, fa: 0, hitTimes: [] as number[] })

  const finish = () => {
    const s = stats.current
    onComplete({
      type: 'attention',
      hits: s.hits,
      misses: TARGET_COUNT - s.hits,
      falseAlarms: s.fa,
      targets: TARGET_COUNT,
      meanHitMs: s.hitTimes.length ? Math.round(mean(s.hitTimes)) : undefined,
      score: attentionScore(s.hits, TARGET_COUNT, s.fa),
    })
  }

  const showItem = (i: number) => {
    if (i >= ITEMS) {
      finish()
      return
    }
    cur.current = i
    responded.current = false
    shownAt.current = performance.now()
    setIdx(i)
    setVisible(true)
    timers.set(() => setVisible(false), VISIBLE_MS)
    timers.set(() => showItem(i + 1), ITEM_MS)
  }

  const start = () => {
    stream.current = buildStream()
    setPhase('running')
    timers.set(() => showItem(0), 800)
  }

  const respond = () => {
    if (phase !== 'running' || cur.current < 0 || responded.current) return
    responded.current = true
    const isTarget = stream.current[cur.current] === TARGET
    const s = stats.current
    if (isTarget) {
      s.hits += 1
      s.hitTimes.push(performance.now() - shownAt.current)
    } else {
      s.fa += 1
    }
    setCounts({ hits: s.hits, fa: s.fa })
    setFlash(isTarget ? 'hit' : 'false')
    timers.set(() => setFlash(null), 250)
  }

  const respondRef = useRef(respond)
  respondRef.current = respond
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      if (e.target instanceof HTMLButtonElement) return
      e.preventDefault()
      if (!e.repeat) respondRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // One-time start. The ref is reset on cleanup so a StrictMode remount (which clears timers) restarts cleanly.
  const started = useRef(false)
  useEffect(() => {
    if (!autoStart || started.current) return
    started.current = true
    start()
    return () => {
      started.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart])

  const ring =
    flash === 'hit'
      ? 'border-ok shadow-[0_0_60px_6px_rgb(74_222_128/0.5)]'
      : flash === 'false'
        ? 'border-red-300 shadow-[0_0_60px_6px_rgb(248_113_113/0.5)]'
        : 'border-cyan/40 shadow-[0_0_40px_0_rgb(85_198_232/0.25)]'

  return (
    <GameFrame
      title="Attention Test"
      progress={phase === 'intro' ? `${ITEMS} symbols, about ${ITEMS} seconds` : `Symbol ${idx + 1} of ${ITEMS} · hits ${counts.hits} · false alarms ${counts.fa}`}
      onCancel={() => {
        timers.clear()
        onCancel()
      }}
      status={flash === 'hit' ? 'Hit' : flash === 'false' ? 'False alarm' : ''}
      current={phase === 'intro' ? 0 : idx + 1}
      total={ITEMS}
    >
      <div className="glass relative flex h-72 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-white/15">
        {phase === 'intro' && !autoStart ? (
          <div className="px-4 text-center">
            <p className="mb-4 text-sm text-muted">
              Symbols appear one at a time. Respond only when you see the triangle{' '}
              <span className="num text-xl text-orange">{TARGET}</span>. Ignore everything else.
            </p>
            <button type="button" className="btn btn-primary" onClick={start} autoFocus>
              Start attention test
            </button>
          </div>
        ) : (
          <>
            <div
              className={`relative flex h-48 w-48 items-center justify-center rounded-full border-2 bg-void/40 transition-[border-color,box-shadow] duration-150 ${ring}`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-3 rounded-full border border-dashed border-violet-soft/30"
              />
              <div
                className={`num font-display text-8xl text-cyan-bright transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`}
                aria-hidden="true"
              >
                {stream.current[idx]}
              </div>
            </div>
            <p
              aria-hidden="true"
              className={`num mt-3 h-6 font-display text-base font-semibold ${flash === 'hit' ? 'text-ok' : 'text-red-200'}`}
            >
              {flash === 'hit' ? 'Hit' : flash === 'false' ? 'False alarm' : ''}
            </p>
          </>
        )}
      </div>
      {phase === 'running' && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={respond}
            onPointerDown={(e) => {
              e.preventDefault()
              respond()
            }}
            className="btn btn-primary h-16 w-full max-w-sm rounded-full text-base shadow-[0_0_30px_rgb(85_198_232/0.45)]"
          >
            I see the target {TARGET} (or press Space)
          </button>
        </div>
      )}
    </GameFrame>
  )
}
