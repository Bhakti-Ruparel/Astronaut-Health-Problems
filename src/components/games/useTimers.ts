import { useEffect, useMemo, useRef } from 'react'

/** Tracks timeouts and clears them all on unmount (safe under StrictMode double-mount). */
export function useTimers() {
  const ids = useRef<number[]>([])
  const api = useMemo(
    () => ({
      set(fn: () => void, ms: number) {
        const id = window.setTimeout(() => {
          ids.current = ids.current.filter((x) => x !== id)
          fn()
        }, ms)
        ids.current.push(id)
        return id
      },
      clear() {
        ids.current.forEach((id) => window.clearTimeout(id))
        ids.current = []
      },
    }),
    [],
  )
  useEffect(() => api.clear, [api])
  return api
}
