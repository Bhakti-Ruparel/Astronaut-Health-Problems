import { memo, useId } from 'react'
import { mulberry32, safeId } from './prng'

const DOTS = (() => {
  const r = mulberry32(99)
  const out: { x: number; y: number; r: number; o: number }[] = []
  for (let i = 0; i < 70; i++) {
    const arm = i % 3
    const t = r() * 3.2 + 0.3
    const a = arm * ((Math.PI * 2) / 3) + t * 1.15
    const d = t * 28 + r() * 8
    out.push({ x: 150 + Math.cos(a) * d, y: 150 + Math.sin(a) * d * 0.6, r: 0.8 + r() * 1.6, o: 0.4 + r() * 0.6 })
  }
  return out
})()

/** Spiral galaxy (viewBox 300x300), seeded so it renders identically each time. */
export const Galaxy = memo(function Galaxy({ className = '', animate = true }: { className?: string; animate?: boolean }) {
  const p = safeId(useId())
  return (
    <svg className={className} viewBox="0 0 300 300" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${p}-core`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".25" stopColor="#d3c6ff" stopOpacity=".9" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className={animate ? 'orbit' : undefined} style={{ animationDuration: '120s' }}>
        <circle cx="150" cy="150" r="120" fill={`url(#${p}-core)`} opacity=".55" />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d="M150 150 C 170 120, 220 110, 250 140 S 260 210, 200 225"
            fill="none"
            stroke="#b39bff"
            strokeOpacity=".5"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="2 9"
            transform={`rotate(${i * 120} 150 150)`}
          />
        ))}
        <g fill="#f4f7fa">
          {DOTS.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} opacity={d.o} />
          ))}
        </g>
        <circle cx="150" cy="150" r="14" fill="#fff" opacity=".9" />
      </g>
    </svg>
  )
})
