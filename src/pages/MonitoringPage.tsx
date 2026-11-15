import { Activity, Radio, RefreshCw, TriangleAlert } from 'lucide-react'
import { PageTitle } from '../components/ui/controls'
import { useMonitoring } from '../hooks/useMonitoring'
import type { TelemetryReading } from '../types/monitoring'

function timeLabel(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function metric(value: number | null, unit: string, digits = 1) {
  return value === null || !Number.isFinite(value) ? '—' : `${value.toFixed(digits)}${unit}`
}

function MetricCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="glass p-4">
      <p className="label-mono">{label}</p>
      <p className="num mt-2 text-2xl font-semibold text-white">
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-muted">{unit}</span>}
      </p>
    </div>
  )
}

function RecentReading({ reading }: { reading: TelemetryReading }) {
  const anomaly = reading.overall_status === 'ANOMALY'
  return (
    <tr className="border-t border-white/10">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">{timeLabel(reading.recorded_at)}</td>
      <td className="px-4 py-3">{reading.stream_type === 'live' ? 'Live model' : 'Reference'}</td>
      <td className="num px-4 py-3">{metric(reading.heart_rate_bpm, ' bpm', 0)}</td>
      <td className="num px-4 py-3">{metric(reading.spo2_percent, '%')}</td>
      <td className="num px-4 py-3">{metric(reading.body_temperature_c, '°C')}</td>
      <td className={`px-4 py-3 font-semibold ${anomaly ? 'text-orange' : 'text-[#86efac]'}`}>
        {reading.overall_status}
      </td>
      <td className="num px-4 py-3">{metric(reading.anomaly_score, '')}</td>
    </tr>
  )
}

export function MonitoringPage() {
  const { snapshot, error, loading } = useMonitoring()
  const latest = snapshot?.readings[0]
  const livePresent = snapshot?.isLive ?? false

  return (
    <div className="space-y-6">
      <PageTitle
        title="Live monitoring"
        subtitle="Telemetry and anomaly analysis from the assigned astronaut’s data stream. Updates every five seconds."
        right={
          <span className={`badge ${livePresent ? 'border-ok/40 bg-ok/15 text-[#86efac]' : 'border-white/20 bg-white/5 text-muted'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${livePresent ? 'bg-ok' : 'bg-muted'}`} aria-hidden="true" />
            {livePresent ? 'Live stream' : 'Waiting for live stream'}
          </span>
        }
      />

      <div role="note" className="glass flex items-start gap-3 p-4 text-sm text-muted">
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-orange" aria-hidden="true" />
        <p>Model output and threshold flags are informational monitoring indicators, not medical diagnoses.</p>
      </div>

      {error && (
        <div className="glass border-orange/40 p-4 text-sm text-[#ffb38f]" role="alert">
          {error}
          {snapshot && <span className="ml-2 text-muted">Showing the last successful update.</span>}
        </div>
      )}

      {loading && !snapshot ? (
        <div className="glass flex items-center gap-3 p-6 text-muted" role="status">
          <RefreshCw size={18} className="animate-spin" aria-hidden="true" />
          Connecting to the assigned telemetry stream…
        </div>
      ) : latest ? (
        <>
          <section className="glass-accent grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center" aria-label="Latest model analysis">
            <div className="flex items-start gap-3">
              <span className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full ${latest.overall_status === 'ANOMALY' ? 'bg-orange/15 text-orange' : 'bg-ok/15 text-ok'}`}>
                {livePresent ? <Radio size={20} aria-hidden="true" /> : <Activity size={20} aria-hidden="true" />}
              </span>
              <div>
                <p className="label-mono">Latest model output · {snapshot?.astronautId}</p>
                <h2 className={`mt-1 font-display text-2xl font-semibold ${latest.overall_status === 'ANOMALY' ? 'text-orange' : 'text-[#86efac]'}`}>
                  {latest.overall_status}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {latest.stream_type === 'live' ? 'Received from the live receiver' : 'From the imported reference dataset'} · {timeLabel(latest.recorded_at)}
                </p>
              </div>
            </div>
            <div className="num text-sm text-muted">
              Model score <span className="ml-1 text-xl font-semibold text-white">{metric(latest.anomaly_score, '')}</span>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Latest telemetry">
            <MetricCard label="Heart rate" value={metric(latest.heart_rate_bpm, '', 0)} unit="bpm" />
            <MetricCard label="Blood oxygen" value={metric(latest.spo2_percent, '', 1)} unit="%" />
            <MetricCard label="Blood pressure" value={`${metric(latest.systolic_bp, '', 0)}/${metric(latest.diastolic_bp, '', 0)}`} unit="mmHg" />
            <MetricCard label="Temperature" value={metric(latest.body_temperature_c, '', 1)} unit="°C" />
          </section>

          <section className="glass overflow-hidden" aria-labelledby="recent-readings">
            <div className="flex flex-wrap items-center justify-between gap-2 p-4">
              <h2 id="recent-readings" className="font-display text-lg font-semibold">Recent readings</h2>
              <p className="text-xs text-muted">Latest {snapshot?.readings.length ?? 0} records · {snapshot?.astronautId}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Recorded</th>
                    <th className="px-4 py-3 font-medium">Stream</th>
                    <th className="px-4 py-3 font-medium">Heart rate</th>
                    <th className="px-4 py-3 font-medium">SpO₂</th>
                    <th className="px-4 py-3 font-medium">Temp</th>
                    <th className="px-4 py-3 font-medium">Analysis</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot?.readings.map((reading, index) => (
                    <RecentReading key={`${reading.stream_type}-${reading.recorded_at}-${index}`} reading={reading} />
                  ))}
                </tbody>
              </table>
            </div>
            {latest.anomalous_features.length > 0 && (
              <div className="border-t border-white/10 p-4">
                <h3 className="text-sm font-semibold">Flagged features</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {latest.anomalous_features.map((feature) => (
                    <li key={feature.feature} className="rounded-full border border-orange/40 bg-orange/10 px-3 py-1 text-xs text-[#ffb38f]">
                      {feature.feature.replaceAll('_', ' ')} · {feature.status} {feature.value} · {feature.severity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="glass p-8 text-center">
          <Radio size={28} className="mx-auto text-cyan" aria-hidden="true" />
          <h2 className="mt-3 font-display text-lg font-semibold">No readings available</h2>
          <p className="mt-1 text-sm text-muted">No reference or live readings are assigned to this account yet.</p>
        </div>
      )}
    </div>
  )
}
