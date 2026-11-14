import { memo, useId } from 'react'
import { safeId } from './prng'

const NODES: [number, number][] = [
  [62, 96], [84, 70], [110, 62], [140, 72], [160, 96], [150, 126], [122, 140],
  [96, 134], [74, 124], [100, 98], [126, 100], [112, 82], [88, 100], [140, 100],
]
const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 0],
  [9, 10], [9, 11], [10, 11], [9, 12], [10, 13], [1, 11], [3, 11], [7, 9], [6, 10], [12, 0], [13, 4],
]

/** Neural brain motif (viewBox 220x200): two-lobe outline, linked nodes and a soft glow. */
export const Brain = memo(function Brain({ className = '', animate = true }: { className?: string; animate?: boolean }) {
  const p = safeId(useId())
  return (
    <svg className={className} viewBox="0 0 220 200" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${p}-s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7de3ff" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <radialGradient id={`${p}-g`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#8b5cf6" stopOpacity=".55" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="100" r="95" fill={`url(#${p}-g)`} />
      <path
        d="M110 50 C 90 36, 60 44, 52 70 C 36 76, 34 104, 48 114 C 44 134, 62 150, 82 146 C 90 160, 108 160, 110 150
           C 112 160, 130 160, 138 146 C 158 150, 176 134, 172 114 C 186 104, 184 76, 168 70 C 160 44, 130 36, 110 50 Z"
        fill="rgb(11 20 48 / .35)"
        stroke={`url(#${p}-s)`}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M110 52 V150" stroke={`url(#${p}-s)`} strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="3 4" />
      <g stroke="#7de3ff" strokeOpacity=".5" strokeWidth="1">
        {LINKS.map(([a, b], i) => (
          <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
        ))}
      </g>
      {NODES.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 4 === 0 ? 4 : 3}
          fill={i % 3 === 0 ? '#f472b6' : '#7de3ff'}
          className={animate ? ['twinkle', 'twinkle-2', 'twinkle-3'][i % 3] : undefined}
        />
      ))}
    </svg>
  )
})
