import { useEffect, useState } from 'react'
import type { MonitoringSnapshot, TelemetryReading } from '../types/monitoring'

function isReading(value: unknown): value is TelemetryReading {
  if (!value || typeof value !== 'object') return false
  const reading = value as Record<string, unknown>
  return (
    (reading.stream_type === 'live' || reading.stream_type === 'reference') &&
    typeof reading.astronaut_id === 'string' &&
    typeof reading.recorded_at === 'string' &&
    typeof reading.source === 'string' &&
    typeof reading.overall_status === 'string' &&
    Array.isArray(reading.anomalous_features)
  )
}

function isSnapshot(value: unknown): value is MonitoringSnapshot {
  if (!value || typeof value !== 'object') return false
  const snapshot = value as Record<string, unknown>
  return (
    typeof snapshot.astronautId === 'string' &&
    typeof snapshot.isLive === 'boolean' &&
    typeof snapshot.liveStaleAfterSeconds === 'number' &&
    Array.isArray(snapshot.readings) &&
    snapshot.readings.every(isReading)
  )
}

export function useMonitoring() {
  const [snapshot, setSnapshot] = useState<MonitoringSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    let inFlight = false

    const refresh = async () => {
      if (inFlight) return
      inFlight = true
      try {
        const response = await fetch('/api/monitoring', {
          cache: 'no-store',
        })
        const result: unknown = await response.json()
        if (!response.ok) {
          const message =
            result && typeof result === 'object'
              ? 'error' in result && typeof result.error === 'string'
                ? result.error
                : 'detail' in result && typeof result.detail === 'string'
                  ? result.detail
                  : 'Monitoring data could not be loaded.'
              : 'Monitoring data could not be loaded.'
          throw new Error(message)
        }
        if (!isSnapshot(result)) throw new Error('The monitoring API returned an invalid response.')
        if (!active) return
        setSnapshot(result)
        setError(null)
      } catch (requestError) {
        if (!active) return
        setError(requestError instanceof Error ? requestError.message : 'Monitoring data could not be loaded.')
      } finally {
        inFlight = false
        if (active) setLoading(false)
      }
    }

    void refresh()
    const intervalId = window.setInterval(() => void refresh(), 5000)
    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  return { snapshot, error, loading }
}
