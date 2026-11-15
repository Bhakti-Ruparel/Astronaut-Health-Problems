import { useState } from 'react'
import { PageTitle } from '../components/ui/controls'
import { useMonitoring } from '../hooks/useMonitoring'
import type { AnomalousFeature, TelemetryReading } from '../types/monitoring'

type TelemetryFeature = keyof Pick<
  TelemetryReading,
  | 'heart_rate_bpm'
  | 'ecg_heart_rate_bpm'
  | 'systolic_bp'
  | 'diastolic_bp'
  | 'spo2_percent'
  | 'respiratory_rate'
  | 'body_temperature_c'
  | 'activity_level'
  | 'sleep_hours'
  | 'body_weight_kg'
  | 'radiation_exposure_msv'
>

interface BodyRegion {
  id: string
  name: string
  summary: string
  features: TelemetryFeature[]
  top: string
  left: string
}

const REGIONS: BodyRegion[] = [
  {
    id: 'head',
    name: 'Core temperature',
    summary: 'Body temperature telemetry and its model threshold flags.',
    features: ['body_temperature_c'],
    top: '13%',
    left: '50%',
  },
  {
    id: 'lungs',
    name: 'Respiration & oxygen',
    summary: 'Respiratory rate and blood oxygen saturation.',
    features: ['respiratory_rate', 'spo2_percent'],
    top: '33%',
    left: '50%',
  },
  {
    id: 'heart',
    name: 'Cardiovascular',
    summary: 'Heart rate, ECG heart rate, and systolic/diastolic pressure.',
    features: ['heart_rate_bpm', 'ecg_heart_rate_bpm', 'systolic_bp', 'diastolic_bp'],
    top: '42%',
    left: '58%',
  },
  {
    id: 'whole-body',
    name: 'Whole-body indicators',
    summary: 'Activity, sleep, body weight, and radiation exposure.',
    features: ['activity_level', 'sleep_hours', 'body_weight_kg', 'radiation_exposure_msv'],
    top: '66%',
    left: '50%',
  },
]

const LABELS: Record<TelemetryFeature, { label: string; unit: string; digits?: number }> = {
  heart_rate_bpm: { label: 'Heart rate', unit: ' bpm', digits: 0 },
  ecg_heart_rate_bpm: { label: 'ECG heart rate', unit: ' bpm', digits: 0 },
  systolic_bp: { label: 'Systolic pressure', unit: ' mmHg', digits: 0 },
  diastolic_bp: { label: 'Diastolic pressure', unit: ' mmHg', digits: 0 },
  spo2_percent: { label: 'Blood oxygen', unit: '%' },
  respiratory_rate: { label: 'Respiratory rate', unit: ' /min' },
  body_temperature_c: { label: 'Body temperature', unit: '°C' },
  activity_level: { label: 'Activity level', unit: '' },
  sleep_hours: { label: 'Sleep', unit: ' h' },
  body_weight_kg: { label: 'Body weight', unit: ' kg' },
  radiation_exposure_msv: { label: 'Radiation exposure', unit: ' mSv', digits: 3 },
}

function formatValue(value: number, unit: string, digits = 1) {
  return `${value.toFixed(digits)}${unit}`
}

function findFlag(flags: AnomalousFeature[], feature: string) {
  return flags.find((flag) => flag.feature === feature)
}

function RegionSummary({ reading, region }: { reading: TelemetryReading; region: BodyRegion }) {
  return (
    <div className="glass-strong w-64 p-4 shadow-[0_0_30px_rgb(0_0_0/0.55)]" role="tooltip">
      <p className="label-mono">Model summary</p>
      <h3 className="mt-1 font-display font-semibold text-white">{region.name}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">{region.summary}</p>
      <ul className="mt-3 space-y-2">
        {region.features.map((feature) => {
          const label = LABELS[feature]
          const value = reading[feature]
          if (!label || typeof value !== 'number') return null
          const flag = findFlag(reading.anomalous_features, feature)
          return (
            <li key={feature} className="flex items-start justify-between gap-2 text-xs">
              <span className="text-muted">{label.label}</span>
              <span className={`num text-right ${flag ? 'text-orange' : 'text-white'}`}>
                {formatValue(value, label.unit, label.digits)}
                {flag && <span className="block text-[10px]">{flag.status} · {flag.severity}</span>}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 border-t border-white/10 pt-2 text-[10px] text-muted">
        Overall model status: <strong className={reading.overall_status === 'ANOMALY' ? 'text-orange' : 'text-[#86efac]'}>{reading.overall_status}</strong>
      </p>
    </div>
  )
}

export function BodyMapPage() {
  const { snapshot, error, loading } = useMonitoring()
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const reading = snapshot?.readings[0]

  return (
    <div className="space-y-6">
      <PageTitle
        title="Body map"
        subtitle="Hover over or focus a marker to see the latest model-backed summary for that body region."
      />

      {error && <div role="alert" className="glass border-orange/40 p-4 text-sm text-[#ffb38f]">{error}</div>}

      {loading && !snapshot ? (
        <div className="glass p-8 text-center text-muted" role="status">Loading assigned astronaut telemetry…</div>
      ) : reading ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="glass telemetry-grid relative p-4 md:p-7" aria-label="Interactive human body map">
            <div className="relative mx-auto h-[570px] max-w-[390px]">
              <svg viewBox="0 0 220 520" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="body-fill" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#55c6e8" stopOpacity=".22" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity=".16" />
                  </linearGradient>
                </defs>
                <g fill="url(#body-fill)" stroke="#7de3ff" strokeOpacity=".8" strokeWidth="2">
                  <ellipse cx="110" cy="45" rx="25" ry="31" />
                  <path d="M99 77h22v25h-22z" />
                  <path d="M82 100c-12 5-23 13-27 28l-13 81c-2 12 16 16 20 4l16-62 7 62-10 91h70l-10-91 7-62 16 62c4 12 22 8 20-4l-13-81c-4-15-15-23-27-28-14 8-42 8-56 0z" />
                  <path d="M75 299h31l-4 101-10 94c-2 15-22 13-21-2l-4-87-8-64z" />
                  <path d="M114 299h31l16 42-8 64-4 87c1 15-19 17-21 2l-10-94z" />
                  <path d="M83 112c15 11 39 11 54 0" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
                </g>
                <path d="M110 145v118m0-88-29 44m29-44 29 44m-29 87-18 83m18-83 18 83" fill="none" stroke="#7de3ff" strokeOpacity=".35" strokeWidth="1" strokeDasharray="4 6" />
              </svg>

              {REGIONS.map((region) => {
                const isOpen = activeRegion === region.id
                const flagged = region.features.some((feature) => findFlag(reading.anomalous_features, feature))
                return (
                  <div
                    key={region.id}
                    className="absolute z-10"
                    style={{ top: region.top, left: region.left, transform: 'translate(-50%, -50%)' }}
                    onMouseEnter={() => setActiveRegion(region.id)}
                    onMouseLeave={() => setActiveRegion(null)}
                  >
                    <button
                      type="button"
                      className={`h-5 w-5 rounded-full border-2 ${flagged ? 'border-orange bg-orange/60' : 'border-cyan-bright bg-cyan/50'} shadow-[0_0_16px_rgb(85_198_232/0.65)]`}
                      aria-label={`Show ${region.name} model summary`}
                      aria-expanded={isOpen}
                      aria-controls={`body-region-${region.id}`}
                      onFocus={() => setActiveRegion(region.id)}
                      onBlur={() => setActiveRegion(null)}
                      onClick={() => setActiveRegion(region.id)}
                    />
                    {isOpen && (
                      <div id={`body-region-${region.id}`} className="absolute left-1/2 top-7 z-20 -translate-x-1/2">
                        <RegionSummary reading={reading} region={region} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="mx-auto max-w-sm text-center text-xs text-muted">
              Hover, click, or keyboard-focus a glowing marker. Orange markers indicate a model-flagged feature.
            </p>
          </section>

          <aside className="glass h-fit p-5" aria-label="Latest reading overview">
            <p className="label-mono">Latest analysis</p>
            <h2 className={`mt-2 font-display text-2xl font-semibold ${reading.overall_status === 'ANOMALY' ? 'text-orange' : 'text-[#86efac]'}`}>
              {reading.overall_status}
            </h2>
            <p className="mt-1 text-sm text-muted">{snapshot?.astronautId} · {new Date(reading.recorded_at).toLocaleString()}</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Model score</dt>
                <dd className="num">{reading.anomaly_score?.toFixed(4) ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Data source</dt>
                <dd>{reading.stream_type === 'live' ? 'Live receiver' : 'Reference CSV'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Live connection</dt>
                <dd className={snapshot?.isLive ? 'text-[#86efac]' : 'text-muted'}>
                  {snapshot?.isLive ? 'Receiving' : 'Waiting'}
                </dd>
              </div>
            </dl>
            {reading.anomalous_features.length > 0 && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <h3 className="text-sm font-semibold">Flagged features</h3>
                <ul className="mt-2 space-y-2 text-xs text-[#ffb38f]">
                  {reading.anomalous_features.map((feature) => (
                    <li key={feature.feature}>{feature.feature.replaceAll('_', ' ')} · {feature.status} · {feature.severity}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-muted">
              Visual grouping is for navigation only. This model’s scores and flags are not medical diagnoses.
            </p>
          </aside>
        </div>
      ) : (
        <div className="glass p-8 text-center">
          <h2 className="font-display text-lg font-semibold">No readings to map</h2>
          <p className="mt-1 text-sm text-muted">Telemetry will appear here after it is imported or received for this account.</p>
        </div>
      )}
    </div>
  )
}
