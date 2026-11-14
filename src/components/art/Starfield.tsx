import { memo } from 'react'

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Star = { x: number; y: number; r: number; o: number }

const LAYERS: Star[][] = (() => {
  const rand = mulberry32(7)
  const layers: Star[][] = [[], [], []]
  for (let i = 0; i < 90; i++) {
    const layer = i % 3
    layers[layer].push({
      x: rand() * 1000,
      y: rand() * 1000,
      r: [0.6, 1, 1.5][layer] * (0.7 + rand() * 0.6),
      o: [0.4, 0.65, 0.95][layer],
    })
  }
  return layers
})()

const CLASSES = ['twinkle', 'twinkle-2', 'twinkle-3']

/** Single-SVG starfield: ~90 seeded stars in 3 depth layers, 3 animated groups. */
export const Starfield = memo(function Starfield({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {LAYERS.map((stars, i) => (
        <g key={i} className={CLASSES[i]} fill="#f4f7fa">
          {stars.map((s, j) => (
            <circle key={j} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
          ))}
        </g>
      ))}
    </svg>
  )
})
