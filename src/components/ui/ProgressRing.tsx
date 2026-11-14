import { useId, type ReactNode } from 'react'

/** Glowing orbital ring with tick marks. `value` is 0-100. */
export function ProgressRing({
  value,
  size = 120,
  color = '#55C6E8',
  children,
  label,
}: {
  value: number
  size?: number
  color?: string
  children?: ReactNode
  label: string
}) {
  const gid = useId()
  const stroke = 6
  const r = (size - stroke * 2) / 2 - 6
  const c = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, value))
  const ticks = Array.from({ length: 36 }, (_, i) => i)
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${Math.round(pct)} out of 100`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={color} />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
          <filter id={`${gid}-f`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {ticks.map((i) => {
          const a = (i / 36) * 2 * Math.PI
          const r1 = size / 2 - 2
          const r2 = size / 2 - (i % 9 === 0 ? 7 : 4)
          const cx = size / 2
          return (
            <line
              key={i}
              x1={cx + r1 * Math.sin(a)}
              y1={cx - r1 * Math.cos(a)}
              x2={cx + r2 * Math.sin(a)}
              y2={cx - r2 * Math.cos(a)}
              stroke="#a9b8d0"
              strokeOpacity={0.5}
            />
          )
        })}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(244,247,250,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid}-g)`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter={`url(#${gid}-f)`}
          style={{ transition: 'stroke-dasharray 600ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
