import { memo, useId } from 'react'
import { mulberry32, safeId } from './prng'

const LIGHTS = (() => {
  const r = mulberry32(21)
  return Array.from({ length: 16 }, () => {
    const a = r() * Math.PI * 2
    const d = 60 + r() * 150
    return { x: 300 + Math.cos(a) * d * 0.9 - 70, y: 300 + Math.sin(a) * d * 0.9 + 20, k: r() }
  })
})()

/** Stylised Earth (viewBox 600x600) with atmosphere glow, clouds, terminator and city lights. */
export const Earth = memo(function Earth({ className = '', animate = true }: { className?: string; animate?: boolean }) {
  const p = safeId(useId())
  const u = (n: string) => `${p}-${n}`
  const ref = (n: string) => `url(#${u(n)})`
  return (
    <svg className={className} viewBox="0 0 600 600" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={u('ocean')} cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor="#1e6bd6" />
          <stop offset=".55" stopColor="#0b3a8a" />
          <stop offset="1" stopColor="#061a4a" />
        </radialGradient>
        <linearGradient id={u('land')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3fb57a" />
          <stop offset="1" stopColor="#1d6a4a" />
        </linearGradient>
        <radialGradient id={u('atmo')} cx=".5" cy=".5" r=".5">
          <stop offset=".86" stopColor="#55c6e8" stopOpacity="0" />
          <stop offset=".93" stopColor="#55c6e8" stopOpacity=".55" />
          <stop offset="1" stopColor="#55c6e8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={u('night')} cx=".72" cy=".62" r=".7">
          <stop offset=".35" stopColor="#020617" stopOpacity="0" />
          <stop offset="1" stopColor="#020617" stopOpacity=".82" />
        </radialGradient>
        <filter id={u('cloud')} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <clipPath id={u('disc')}>
          <circle cx="300" cy="300" r="240" />
        </clipPath>
      </defs>

      <circle cx="300" cy="300" r="290" fill={ref('atmo')} />
      <circle cx="300" cy="300" r="240" fill={ref('ocean')} />

      <g clipPath={ref('disc')}>
        <g fill={ref('land')}>
          <path d="M150 170 C190 130 270 140 290 190 C310 240 250 250 240 300 C230 350 180 340 160 290 C140 250 120 210 150 170 Z" />
          <path d="M330 330 C380 300 450 330 470 390 C480 440 420 480 380 460 C340 440 300 380 330 330 Z" />
          <path d="M360 110 C410 90 470 120 480 170 C470 200 420 190 390 170 C360 150 345 125 360 110 Z" />
          <path d="M120 400 C160 380 210 400 220 440 C200 480 150 490 125 460 C105 440 105 415 120 400 Z" />
          <path d="M450 250 C480 240 510 260 505 290 C490 305 460 295 450 250 Z" />
        </g>
        <g fill="#8fe0a8" opacity=".35">
          <path d="M190 180 C220 165 255 175 262 200 C240 215 205 205 190 180 Z" />
          <path d="M360 350 C395 340 430 355 435 385 C410 395 375 385 360 350 Z" />
        </g>
        <g
          fill="#fff"
          opacity=".55"
          filter={ref('cloud')}
          className={animate ? 'orbit' : undefined}
          style={{ transformBox: 'view-box', transformOrigin: '50% 50%',  animationDuration: '240s' }}
        >
          <ellipse cx="200" cy="140" rx="70" ry="14" />
          <ellipse cx="340" cy="220" rx="90" ry="12" />
          <ellipse cx="260" cy="320" rx="80" ry="13" />
          <ellipse cx="420" cy="300" rx="60" ry="11" />
          <ellipse cx="150" cy="280" rx="55" ry="10" />
          <ellipse cx="380" cy="440" rx="85" ry="13" />
          <ellipse cx="230" cy="430" rx="70" ry="11" />
          <ellipse cx="440" cy="160" rx="50" ry="9" />
          <ellipse cx="310" cy="90" rx="60" ry="9" />
        </g>
        <circle cx="300" cy="300" r="240" fill={ref('night')} />
        <g fill="#ffd27a">
          {LIGHTS.map((l, i) => (
            <circle key={i} cx={l.x} cy={l.y} r={1.2 + l.k * 1.4} opacity={0.4 + l.k * 0.5} />
          ))}
        </g>
      </g>

      {/* lit-edge crescent */}
      <path d="M92 190 A240 240 0 0 1 300 60" fill="none" stroke="#bff3ff" strokeOpacity=".75" strokeWidth="4" strokeLinecap="round" />
      <circle cx="300" cy="300" r="241" fill="none" stroke="#7de3ff" strokeOpacity=".25" strokeWidth="2" />
    </svg>
  )
})
