import { memo, useId } from 'react'
import { safeId } from './prng'

export type PlanetVariant = 'ringed' | 'gas' | 'moon' | 'ice' | 'nebula'

const BASE: Record<PlanetVariant, [string, string]> = {
  ringed: ['#fbc2eb', '#a18cd1'],
  gas: ['#9ddcfb', '#4a5bd8'],
  moon: ['#d5d9e6', '#7a829c'],
  ice: ['#ffffff', '#55c6e8'],
  nebula: ['#f472b6', '#8b5cf6'],
}

/** Glossy planet (viewBox 200x200). Light source top-left, crescent shadow bottom-right. */
export const Planet = memo(function Planet({
  variant = 'ringed',
  className = '',
  animate = false,
}: {
  variant?: PlanetVariant
  className?: string
  animate?: boolean
}) {
  const p = safeId(useId())
  const u = (n: string) => `${p}-${n}`
  const ref = (n: string) => `url(#${u(n)})`
  const [c1, c2] = BASE[variant]
  const R = variant === 'ringed' ? 54 : 78
  const ringTilt = 'rotate(-18 100 100)'

  const ring = (front: boolean) => (
    <g transform={ringTilt}>
      <clipPath id={u(front ? 'rf' : 'rb')}>
        {front ? <rect x="0" y="100" width="200" height="100" /> : <rect x="0" y="0" width="200" height="100" />}
      </clipPath>
      <g clipPath={ref(front ? 'rf' : 'rb')}>
        <ellipse cx="100" cy="100" rx="96" ry="24" fill="none" stroke={ref('ring')} strokeWidth="9" />
        <ellipse cx="100" cy="100" rx="80" ry="19" fill="none" stroke={ref('ring')} strokeWidth="3" opacity=".7" />
      </g>
    </g>
  )

  if (variant === 'nebula') {
    return (
      <svg className={className} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs>
          {[
            ['a', '#8b5cf6'],
            ['b', '#f472b6'],
            ['c', '#55c6e8'],
          ].map(([k, c]) => (
            <radialGradient key={k} id={u(k)} cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor={c} stopOpacity=".85" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>
        <circle cx="90" cy="95" r="80" fill={ref('a')} />
        <circle cx="125" cy="80" r="62" fill={ref('b')} />
        <circle cx="105" cy="130" r="56" fill={ref('c')} opacity=".8" />
        <g fill="#fff">
          <circle cx="60" cy="60" r="1.6" />
          <circle cx="140" cy="140" r="1.4" />
          <circle cx="150" cy="50" r="1.8" />
          <circle cx="45" cy="130" r="1.2" />
          <circle cx="110" cy="100" r="1.5" />
        </g>
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={u('sphere')} cx=".3" cy=".3" r=".9">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </radialGradient>
        <radialGradient id={u('shade')} cx=".3" cy=".3" r=".85">
          <stop offset=".55" stopColor="#0b1030" stopOpacity="0" />
          <stop offset="1" stopColor="#0b1030" stopOpacity=".6" />
        </radialGradient>
        <linearGradient id={u('ring')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7de3ff" stopOpacity=".2" />
          <stop offset=".3" stopColor="#fbc2eb" />
          <stop offset=".7" stopColor="#b39bff" />
          <stop offset="1" stopColor="#7de3ff" stopOpacity=".2" />
        </linearGradient>
        <clipPath id={u('clip')}>
          <circle cx="100" cy="100" r={R} />
        </clipPath>
      </defs>
      <g className={animate ? 'float' : undefined}>
        {variant === 'ringed' && ring(false)}
        <circle cx="100" cy="100" r={R} fill={ref('sphere')} />
        {variant === 'gas' && (
          <g clipPath={ref('clip')}>
            <rect x="20" y="52" width="160" height="12" fill="#fff" opacity=".28" />
            <rect x="20" y="76" width="160" height="16" fill="#1e2a8a" opacity=".3" />
            <rect x="20" y="104" width="160" height="10" fill="#f9a8d4" opacity=".4" />
            <rect x="20" y="126" width="160" height="14" fill="#fff" opacity=".22" />
            <ellipse cx="124" cy="110" rx="14" ry="7" fill="#f472b6" opacity=".75" />
          </g>
        )}
        {variant === 'moon' && (
          <g clipPath={ref('clip')}>
            {[
              [70, 75, 13],
              [118, 68, 9],
              [128, 118, 16],
              [80, 128, 10],
              [100, 100, 6],
            ].map(([x, y, r], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={r} fill="#5b627e" opacity=".55" />
                <path d={`M${x - r} ${y} A${r} ${r} 0 0 1 ${x + r} ${y}`} fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="1.5" />
              </g>
            ))}
          </g>
        )}
        <circle cx="100" cy="100" r={R} fill={ref('shade')} />
        <ellipse cx="78" cy="72" rx="20" ry="11" fill="#fff" opacity=".35" transform="rotate(-30 78 72)" />
        {variant === 'ringed' && ring(true)}
      </g>
    </svg>
  )
})
