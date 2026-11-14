import { memo, useId } from 'react'
import { safeId } from './prng'

// One PQRST beat, 100 units wide, baseline at y=30.
const BEAT = 'L30 30 Q35 24 40 30 L46 30 L50 36 L55 4 L60 52 L64 30 L72 30 Q80 20 88 30 L100 30'
const PATH = (() => {
  let d = 'M0 30 '
  for (let i = 0; i < 4; i++) {
    d += BEAT.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${Number(x) + i * 100} ${y}`) + ' '
  }
  return d
})()

/** ECG line (viewBox 400x60) with gradient stroke and a travelling bright dash. */
export const Pulse = memo(function Pulse({
  className = '',
  color = '#7de3ff',
  animate = true,
}: {
  className?: string
  color?: string
  animate?: boolean
}) {
  const p = safeId(useId())
  return (
    <svg className={className} viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${p}-g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset=".5" stopColor={color} />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity=".8" />
        </linearGradient>
      </defs>
      <path d={PATH} fill="none" stroke={`url(#${p}-g)`} strokeOpacity=".35" strokeWidth="6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={PATH} fill="none" stroke={`url(#${p}-g)`} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {animate && (
        <path
          className="pulse-dash"
          d={PATH}
          pathLength={100}
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="6 94"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  )
})
