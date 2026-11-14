import { useId } from 'react'

export function OrbitMark({ size = 30 }: { size?: number }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7de3ff" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="5.5" fill={`url(#${id}-g)`} />
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6"
        fill="none"
        stroke="#7de3ff"
        strokeOpacity="0.8"
        strokeWidth="1.4"
        transform="rotate(-25 16 16)"
      />
      <circle cx="27" cy="10" r="1.8" fill="#fc6d26" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <OrbitMark />
      <span className="font-display text-lg font-semibold tracking-tight">
        Astro<span className="text-cyan-bright">Mind</span>
      </span>
    </span>
  )
}
