import { useEffect, useRef, useState } from 'react'
import './assessment.css'

/** 3-2-1 launch countdown. Calls onDone after three seconds. */
export function Countdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3)
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    setN(3)
    const ids = [
      window.setTimeout(() => setN(2), 1000),
      window.setTimeout(() => setN(1), 2000),
      window.setTimeout(() => done.current(), 3000),
    ]
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <p className="label-mono text-cyan-bright">Launch sequence</p>
      <div className="relative flex h-64 w-64 items-center justify-center md:h-72 md:w-72">
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="countdown-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7de3ff" />
              <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="6" />
          <circle
            key={n}
            className="countdown-ring"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#countdown-grad)"
            strokeWidth="6"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 8px rgb(125 227 255 / 0.8))' }}
          />
        </svg>
        <div
          key={n}
          className="countdown-num num font-display text-9xl font-bold text-white text-glow"
          style={{ textShadow: '0 0 30px rgb(125 227 255 / 0.7)' }}
          aria-hidden="true"
        >
          {n}
        </div>
      </div>
      <p className="max-w-xs text-sm text-muted">Get ready. The test starts when the countdown ends.</p>
      <p className="sr-only" role="status" aria-live="assertive">
        {`Starting in ${n}`}
      </p>
    </div>
  )
}
