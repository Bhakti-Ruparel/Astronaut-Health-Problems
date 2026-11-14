import { memo, useId } from 'react'
import { safeId } from './prng'

interface Props {
  className?: string
  /** Float animation (motion-gated in CSS). */
  animate?: boolean
  /** `mini` renders only helmet and shoulders (avatars, empty states). */
  pose?: 'hero' | 'mini'
  /** Visor reflection tint. */
  visorTint?: string
}

/**
 * Glossy, layered inline-SVG astronaut. Generic suit and mission patch, no agency marks.
 * Only the figure group floats (transform); filters sit on small rim strokes only.
 */
export const Astronaut = memo(function Astronaut({
  className = '',
  animate = true,
  pose = 'hero',
  visorTint = '#7de3ff',
}: Props) {
  const p = safeId(useId())
  const u = (n: string) => `${p}-${n}`
  const ref = (n: string) => `url(#${u(n)})`
  const mini = pose === 'mini'

  const arm = (side: 'l' | 'r') => {
    const rim = side === 'l' ? '#7de3ff' : '#a78bfa'
    return (
      <g transform={side === 'r' ? 'translate(400 0) scale(-1 1)' : undefined}>
        {/* upper arm */}
        <g transform="translate(140 254) rotate(30)">
          <rect x="-23" y="-12" width="46" height="98" rx="23" fill={ref('suit')} />
          <rect x="-23" y="-12" width="46" height="98" rx="23" fill={ref('shade')} />
          <path d="M-23 36 H23 M-23 44 H23" stroke="#8c97b8" strokeOpacity=".55" strokeWidth="1.6" />
          <path d="M-20 -2 Q-23 30 -19 74" fill="none" stroke={rim} strokeOpacity=".7" strokeWidth="2" filter={ref('rim')} />
        </g>
        {/* elbow ring */}
        <ellipse cx="96" cy="332" rx="26" ry="12" transform="rotate(30 96 332)" fill={ref('ring')} />
        {/* forearm */}
        <g transform="translate(96 332) rotate(-12)">
          <rect x="-21" y="-6" width="42" height="80" rx="21" fill={ref('suit')} />
          <rect x="-21" y="-6" width="42" height="80" rx="21" fill={ref('shade')} />
          <path d="M-18 4 Q-21 34 -17 62" fill="none" stroke={rim} strokeOpacity=".6" strokeWidth="2" filter={ref('rim')} />
        </g>
        {/* cuff + glove */}
        <g transform="translate(112 412)">
          <rect x="-24" y="-8" width="48" height="16" rx="8" fill={ref('ring')} />
          <path
            d="M-22 2 Q-26 28 -12 38 Q0 44 12 38 Q26 28 22 2 Z"
            fill={ref('glove')}
          />
          <path d="M-12 20 Q-4 26 4 20 M-8 30 Q0 35 8 30" fill="none" stroke="#6b7596" strokeOpacity=".7" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-20 6 Q-23 26 -13 34" fill="none" stroke={rim} strokeOpacity=".7" strokeWidth="2" />
        </g>
      </g>
    )
  }

  return (
    <svg
      className={className}
      viewBox={mini ? '80 40 240 240' : '0 0 400 520'}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={u('suit')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#dfe5f5" />
          <stop offset="1" stopColor="#aab4d3" />
        </linearGradient>
        <linearGradient id={u('shade')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1e2850" stopOpacity="0" />
          <stop offset=".6" stopColor="#1e2850" stopOpacity=".08" />
          <stop offset="1" stopColor="#1e2850" stopOpacity=".35" />
        </linearGradient>
        <linearGradient id={u('pack')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfd6e6" />
          <stop offset="1" stopColor="#8f9ab4" />
        </linearGradient>
        <linearGradient id={u('ring')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d1e8" />
          <stop offset="1" stopColor="#7a86a8" />
        </linearGradient>
        <linearGradient id={u('glove')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f6fd" />
          <stop offset="1" stopColor="#9aa5c6" />
        </linearGradient>
        <linearGradient id={u('boot')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9edf8" />
          <stop offset="1" stopColor="#8e99b8" />
        </linearGradient>
        <radialGradient id={u('helmet')} cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".5" stopColor="#e3e8f7" />
          <stop offset="1" stopColor="#a3aecf" />
        </radialGradient>
        <radialGradient id={u('crescent')} cx=".33" cy=".28" r=".85">
          <stop offset=".55" stopColor="#1e2850" stopOpacity="0" />
          <stop offset="1" stopColor="#1e2850" stopOpacity=".4" />
        </radialGradient>
        <radialGradient id={u('visor')} cx=".4" cy=".3" r=".9">
          <stop offset="0" stopColor="#2a1f7a" />
          <stop offset=".5" stopColor="#1b1b5e" />
          <stop offset="1" stopColor="#0a0f2e" />
        </radialGradient>
        <linearGradient id={u('streak1')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={visorTint} stopOpacity=".85" />
          <stop offset="1" stopColor={visorTint} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={u('streak2')} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#a78bfa" stopOpacity=".75" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={u('shadow')} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={u('led')} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={u('rim')} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={u('visorClip')}>
          <ellipse cx="200" cy="138" rx="62" ry="51" />
        </clipPath>
      </defs>

      {!mini && <ellipse cx="200" cy="506" rx="110" ry="13" fill={ref('shadow')} className={animate ? 'twinkle-2' : undefined} />}

      <g className={animate ? 'float' : undefined}>
        {/* tether */}
        {!mini && (
          <path
            d="M286 300 C 340 300, 372 340, 352 400 S 340 480, 392 520"
            fill="none"
            stroke="#7de3ff"
            strokeOpacity=".55"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 7"
          />
        )}

        {/* life-support backpack */}
        <rect x="108" y="206" width="184" height="152" rx="30" fill={ref('pack')} />
        <rect x="108" y="206" width="184" height="152" rx="30" fill={ref('shade')} />
        <rect x="120" y="224" width="30" height="8" rx="4" fill="#4b5578" opacity=".7" />
        <rect x="120" y="240" width="30" height="8" rx="4" fill="#4b5578" opacity=".7" />
        <circle cx="278" cy="230" r="4" fill="#7de3ff" />
        <circle cx="278" cy="230" r="9" fill={ref('led')} opacity=".5" className={animate ? 'twinkle' : undefined} />

        {!mini && (
          <>
            {/* legs */}
            <g>
              <rect x="146" y="352" width="52" height="124" rx="24" fill={ref('suit')} />
              <rect x="146" y="352" width="52" height="124" rx="24" fill={ref('shade')} />
              <rect x="202" y="352" width="52" height="124" rx="24" fill={ref('suit')} />
              <rect x="202" y="352" width="52" height="124" rx="24" fill={ref('shade')} />
              <path d="M148 410 H196 M204 410 H252" stroke="#8c97b8" strokeOpacity=".6" strokeWidth="1.8" />
              <ellipse cx="172" cy="414" rx="26" ry="7" fill={ref('ring')} opacity=".85" />
              <ellipse cx="228" cy="414" rx="26" ry="7" fill={ref('ring')} opacity=".85" />
              <path d="M150 368 Q146 420 152 470" fill="none" stroke="#7de3ff" strokeOpacity=".6" strokeWidth="2" filter={ref('rim')} />
              <path d="M250 368 Q254 420 248 470" fill="none" stroke="#a78bfa" strokeOpacity=".6" strokeWidth="2" filter={ref('rim')} />
            </g>
            {/* boots */}
            <g>
              <path d="M142 466 H200 V492 Q200 504 186 504 H150 Q134 504 134 490 Q134 472 142 466 Z" fill={ref('boot')} />
              <path d="M200 466 H258 Q266 472 266 490 Q266 504 250 504 H214 Q200 504 200 492 Z" fill={ref('boot')} />
              <rect x="132" y="496" width="70" height="9" rx="4.5" fill="#262f55" />
              <rect x="198" y="496" width="70" height="9" rx="4.5" fill="#262f55" />
              <rect x="146" y="470" width="48" height="8" rx="4" fill={ref('ring')} />
              <rect x="206" y="470" width="48" height="8" rx="4" fill={ref('ring')} />
            </g>
          </>
        )}

        {/* arms sit behind the torso edge but in front of the pack */}
        {!mini && arm('l')}
        {!mini && arm('r')}

        {/* torso */}
        <path
          d="M134 240 Q134 222 160 222 H240 Q266 222 266 240 L272 342 Q272 372 244 374 H156 Q128 372 128 342 Z"
          fill={ref('suit')}
        />
        <path
          d="M134 240 Q134 222 160 222 H240 Q266 222 266 240 L272 342 Q272 372 244 374 H156 Q128 372 128 342 Z"
          fill={ref('shade')}
        />
        <path d="M137 236 Q131 300 133 350" fill="none" stroke="#7de3ff" strokeOpacity=".7" strokeWidth="2" filter={ref('rim')} />
        <path d="M263 236 Q269 300 267 350" fill="none" stroke="#a78bfa" strokeOpacity=".7" strokeWidth="2" filter={ref('rim')} />

        {/* shoulder mission patch (generic) */}
        <g transform="translate(150 262)">
          <circle r="15" fill="#101d35" stroke="#dfe5f5" strokeWidth="2" />
          <ellipse rx="12" ry="4.5" fill="none" stroke="#7de3ff" strokeWidth="1.2" transform="rotate(-25)" />
          <path d="M0 -6 L1.8 -1.8 L6.5 -1.5 L2.8 1.4 L4 6 L0 3.4 L-4 6 L-2.8 1.4 L-6.5 -1.5 L-1.8 -1.8 Z" fill="#fc6d26" />
        </g>

        {/* chest control panel */}
        <rect x="166" y="248" width="68" height="56" rx="11" fill="#1a2347" stroke="#c9d1e8" strokeWidth="2.5" />
        <rect x="166" y="248" width="68" height="56" rx="11" fill="none" stroke="#7de3ff" strokeOpacity=".35" strokeWidth="1" />
        <circle cx="180" cy="261" r="4" fill="#7de3ff" />
        <circle cx="196" cy="261" r="4" fill="#fc6d26" />
        <circle cx="212" cy="261" r="4" fill="#a78bfa" />
        <circle cx="180" cy="261" r="9" fill={ref('led')} opacity=".35" className={animate ? 'twinkle' : undefined} />
        <polyline
          points="173,284 183,284 187,276 192,293 197,280 201,284 227,284"
          fill="none"
          stroke="#7de3ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* belt and orange stripe */}
        <path d="M129 346 H271 L272 362 Q272 374 244 374 H156 Q128 374 128 362 Z" fill="#232c55" />
        <rect x="128" y="350" width="144" height="9" fill="#fc6d26" />
        <rect x="190" y="346" width="20" height="18" rx="4" fill="#c9d1e8" />

        {/* neck ring */}
        <rect x="146" y="206" width="108" height="26" rx="13" fill={ref('ring')} />
        <path d="M152 214 H248" stroke="#fff" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />

        {/* ear caps */}
        <rect x="104" y="116" width="22" height="46" rx="11" fill={ref('ring')} />
        <rect x="274" y="116" width="22" height="46" rx="11" fill={ref('ring')} />

        {/* helmet */}
        <circle cx="200" cy="132" r="88" fill={ref('helmet')} />
        <circle cx="200" cy="132" r="88" fill={ref('crescent')} />
        <path d="M122 90 Q150 50 200 46" fill="none" stroke="#7de3ff" strokeOpacity=".75" strokeWidth="2.5" strokeLinecap="round" filter={ref('rim')} />
        <path d="M288 160 Q276 202 236 216" fill="none" stroke="#a78bfa" strokeOpacity=".75" strokeWidth="2.5" strokeLinecap="round" filter={ref('rim')} />

        {/* visor */}
        <ellipse cx="200" cy="138" rx="68" ry="57" fill="#c9d1e8" />
        <ellipse cx="200" cy="138" rx="62" ry="51" fill={ref('visor')} />
        <g clipPath={ref('visorClip')}>
          <path d="M138 100 L196 86 L150 160 Z" fill={ref('streak1')} opacity=".9" />
          <path d="M262 190 L214 196 L258 130 Z" fill={ref('streak2')} opacity=".85" />
          <path d="M150 176 Q200 206 252 168" fill="none" stroke="#7de3ff" strokeOpacity=".45" strokeWidth="3" />
          <circle cx="238" cy="172" r="9" fill="#1e6bd6" opacity=".8" />
          <path d="M231 169 Q238 163 246 168" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.5" />
          <circle cx="170" cy="108" r="4.5" fill="#fff" opacity=".95" />
          <circle cx="170" cy="108" r="11" fill={ref('led')} opacity=".6" />
        </g>
        <ellipse cx="200" cy="138" rx="62" ry="51" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
      </g>
    </svg>
  )
})
