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
}: {
  onComplete: (r: GameResult) => void
  onCancel: () => void
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

  return (
    <GameFrame
      title="Attention Test"
      progress={phase === 'intro' ? `${ITEMS} symbols, about ${ITEMS} seconds` : `Symbol ${idx + 1} of ${ITEMS} · hits ${counts.hits} · false alarms ${counts.fa}`}
      onCancel={() => {
        timers.clear()
        onCancel()
      }}
      status={flash === 'hit' ? 'Hit' : flash === 'false' ? 'False alarm' : ''}
    >
      <div
        className={`flex h-56 items-center justify-center rounded-xl border-2 bg-navy transition-colors ${
          flash === 'hit' ? 'border-ok' : flash === 'false' ? 'border-red-300' : 'border-white/15'
        }`}
      >
        {phase === 'intro' ? (
          <div className="px-4 text-center">
            <p className="mb-4 text-sm text-muted">
              Symbols appear one at a time. Respond only when you see the triangle{' '}
              <span className="font-mono text-xl text-orange">{TARGET}</span>. Ignore everything else.
            </p>
            <button type="button" className="btn btn-primary" onClick={start} autoFocus>
              Start attention test
            </button>
          </div>
        ) : (
          <div className="font-mono text-8xl text-cyan" aria-hidden="true">
            {visible ? stream.current[idx] : ''}
          </div>
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
            className="btn btn-primary h-14 w-full max-w-sm text-base"
          >
            I see the target {TARGET} (or press Space)
          </button>
        </div>
      )}
    </GameFrame>
  )
}
