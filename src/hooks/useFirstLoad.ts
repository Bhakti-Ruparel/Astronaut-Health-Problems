import { useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/** True for ~500 ms after first mount (for skeletons); false immediately under reduced motion. */
export function useFirstLoad(ms = 500): boolean {
  const reduced = useReducedMotion()
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), ms)
    return () => window.clearTimeout(t)
  }, [ms])
  return loading && !reduced
}
