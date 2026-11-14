import { memo } from 'react'

/** Concentric dashed orbits (viewBox 240x240) with small planets travelling along them. */
export const OrbitRings = memo(function OrbitRings({
  className = '',
  animate = true,
}: {
  className?: string
  animate?: boolean
}) {
  return (
    <svg className={className} viewBox="0 0 240 240" aria-hidden="true" focusable="false">
      <g fill="none" stroke="#7de3ff" strokeOpacity=".35" strokeDasharray="3 6">
        <circle cx="120" cy="120" r="112" />
        <circle cx="120" cy="120" r="88" strokeOpacity=".5" />
        <circle cx="120" cy="120" r="64" />
      </g>
      <g className={animate ? 'orbit' : undefined} style={{ transformBox: 'view-box', transformOrigin: '50% 50%',  animationDuration: '40s' }}>
        <circle cx="120" cy="8" r="6" fill="#f472b6" />
        <circle cx="120" cy="8" r="11" fill="#f472b6" opacity=".25" />
      </g>
      <g className={animate ? 'orbit' : undefined} style={{ transformBox: 'view-box', transformOrigin: '50% 50%',  animationDuration: '65s', animationDirection: 'reverse' }}>
        <circle cx="120" cy="32" r="4.5" fill="#7de3ff" />
      </g>
      <g className={animate ? 'orbit' : undefined} style={{ transformBox: 'view-box', transformOrigin: '50% 50%',  animationDuration: '90s' }}>
        <circle cx="120" cy="56" r="3.5" fill="#fc6d26" />
      </g>
    </svg>
  )
})
