import { memo, useId } from 'react'
import type { ModuleId } from '../../lib/theme'
import { ACCENTS } from '../../lib/theme'
import { safeId } from './prng'

/**
 * Decorative 120x120 illustration per health module. Fades to transparent on the left
 * (mask) so text placed over the left side stays on a clean surface.
 */
export const ModuleArt = memo(function ModuleArt({ module, className = '' }: { module: ModuleId; className?: string }) {
  const p = safeId(useId())
  const a = ACCENTS[module]
  const c = a.main
  const body = (() => {
    switch (module) {
      case 'cognitive':
        return (
          <g stroke={c} fill="none" strokeWidth="2">
            <path d="M60 24 C46 14 24 20 20 42 C8 46 8 68 18 74 C16 90 32 100 46 96 C52 106 60 106 60 98 C60 106 68 106 74 96 C88 100 104 90 102 74 C112 68 112 46 100 42 C96 20 74 14 60 24 Z" fill={c} fillOpacity=".12" />
            <path d="M60 26 V98" strokeDasharray="3 4" strokeOpacity=".6" />
            {[[36, 52], [50, 40], [74, 40], [86, 56], [44, 74], [78, 76]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3.5" fill={a.soft} stroke="none" />
            ))}
            <path d="M36 52 L50 40 L74 40 L86 56 L78 76 M44 74 L36 52 M50 40 L60 60 L78 76" strokeOpacity=".6" strokeWidth="1.2" />
          </g>
        )
      case 'reaction':
        return (
          <g>
            <circle cx="60" cy="60" r="44" fill="none" stroke={c} strokeOpacity=".3" strokeDasharray="2 6" />
            <circle cx="60" cy="60" r="28" fill={c} fillOpacity=".15" stroke={c} strokeOpacity=".6" />
            <circle cx="60" cy="60" r="12" fill={a.soft} />
            <circle cx="60" cy="60" r="20" fill="none" stroke={a.soft} strokeOpacity=".5" className="pulse-ring" />
            <path d="M66 24 L52 58 H64 L54 96 L82 52 H68 Z" fill={c} opacity=".9" />
          </g>
        )
      case 'memory':
        return (
          <g>
            {[0, 1, 2].flatMap((r) =>
              [0, 1, 2].map((col) => {
                const lit = (r * 3 + col) % 4 === 0 || (r + col) === 3
                return (
                  <rect
                    key={`${r}${col}`}
                    x={22 + col * 26}
                    y={22 + r * 26}
                    width="22"
                    height="22"
                    rx="7"
                    fill={lit ? c : '#fff'}
                    fillOpacity={lit ? 0.75 : 0.08}
                    stroke={c}
                    strokeOpacity={lit ? 1 : 0.3}
                  />
                )
              }),
            )}
          </g>
        )
      case 'attention':
        return (
          <g fill="none" stroke={c}>
            <circle cx="60" cy="60" r="46" strokeOpacity=".35" strokeDasharray="4 5" />
            <circle cx="60" cy="60" r="30" strokeOpacity=".6" />
            <path d="M60 8 V30 M60 90 V112 M8 60 H30 M90 60 H112" strokeWidth="2" />
            <circle cx="60" cy="60" r="10" fill={c} stroke="none" />
            <ellipse cx="60" cy="60" rx="24" ry="7" stroke={a.soft} transform="rotate(-20 60 60)" />
          </g>
        )
      case 'sleep':
        return (
          <g>
            <path d="M76 22 A38 38 0 1 0 98 80 A30 30 0 0 1 76 22 Z" fill={c} fillOpacity=".85" />
            <path d="M76 22 A38 38 0 0 0 58 36" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
            {[[28, 28, 3], [100, 40, 2.2], [84, 92, 2.6], [20, 80, 2]].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill="#fff" className={['twinkle', 'twinkle-2', 'twinkle-3', 'twinkle'][i]} />
            ))}
          </g>
        )
      case 'fatigue':
        return (
          <g>
            <circle cx="60" cy="60" r="40" fill="none" stroke={c} strokeOpacity=".25" strokeWidth="8" />
            <path d="M60 20 A40 40 0 0 1 98 72" fill="none" stroke={c} strokeWidth="8" strokeLinecap="round" />
            <circle cx="60" cy="60" r="18" fill={c} fillOpacity=".85" />
            <ellipse cx="54" cy="54" rx="6" ry="3.5" fill="#fff" opacity=".4" transform="rotate(-30 54 54)" />
          </g>
        )
      case 'stress':
        return (
          <g>
            <circle cx="70" cy="50" r="38" fill={c} fillOpacity=".14" />
            <circle cx="52" cy="66" r="26" fill="#a78bfa" fillOpacity=".16" />
            <path d="M6 66 H34 L42 50 L54 88 L64 38 L72 66 H114" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )
    }
  })()
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${p}-m`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".85" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id={`${p}-mask`}>
          <rect width="120" height="120" fill={`url(#${p}-m)`} />
        </mask>
      </defs>
      <g mask={`url(#${p}-mask)`}>{body}</g>
    </svg>
  )
})
