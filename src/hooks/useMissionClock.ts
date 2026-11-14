import { useEffect, useState } from 'react'
import { MISSION } from '../data/constants'

const pad = (n: number) => String(n).padStart(2, '0')

/** Demo mission elapsed time: starts at a fixed offset and ticks every second from app load. */
export function useMissionClock(): string {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const id = window.setInterval(() => setElapsed(Math.floor((performance.now() - start) / 1000)), 1000)
    return () => window.clearInterval(id)
  }, [])

  const m = MISSION.metStart
  const total = m.days * 86400 + m.hours * 3600 + m.minutes * 60 + m.seconds + elapsed
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const min = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${pad(d)}:${pad(h)}:${pad(min)}:${pad(s)}`
}
