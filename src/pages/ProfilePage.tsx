import { RefreshCw, RotateCcw } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { PageTitle, SectionHeader, Toggle } from '../components/ui/controls'
import { DemoBadge, StatusBadge } from '../components/ui/StatusBadge'
import { ASTRONAUT, DISCLAIMER, MISSION } from '../data/constants'
import { formatDateTime } from '../lib/stats'
import { useApp } from '../store/AppStore'
import type { AlertRuleId, AssessmentResult } from '../types'

const RULES: { id: AlertRuleId; label: string }[] = [
  { id: 'reaction-slow', label: 'Reaction time slower than baseline' },
  { id: 'memory-decline', label: 'Memory accuracy declining' },
  { id: 'sleep-decrease', label: 'Sleep duration decreasing' },
  { id: 'fatigue-rising', label: 'Fatigue reports rising' },
]

function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-2 text-sm last:border-0">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-mono">{v}</dd>
    </div>
  )
}

function keyMetric(a: AssessmentResult): string {
  if (a.type === 'reaction') return `${a.reactionMs} ms avg`
  if (a.type === 'memory') return `${a.accuracy}% accuracy`
  return `${a.hits}/${a.targets} hits, ${a.falseAlarms} false alarms`
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <label htmlFor={id}>{label}</label>
        <span className="font-mono text-cyan">
          {value}
          {unit}
        </span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

export function ProfilePage() {
  const { assessments, baseline, preferences, updatePreferences, recalibrateBaseline, resetDemo } = useApp()
  const [showAll, setShowAll] = useState(false)
  const history = [...assessments].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  const rows = showAll ? history : history.slice(0, 15)

  return (
    <div>
      <PageTitle
        title="Mission Profile"
        subtitle="Astronaut profile, mission details, personal baseline and monitoring preferences."
        right={<DemoBadge label="Fictional sample profile" />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5" aria-label="Astronaut profile">
          <div className="mb-4 flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange font-mono text-xl font-semibold text-navy">
              {ASTRONAUT.initials}
            </span>
            <div>
              <h2 className="text-xl font-semibold">{ASTRONAUT.name}</h2>
              <p className="text-sm text-muted">{ASTRONAUT.role}</p>
              <StatusBadge tone="info">Fictional</StatusBadge>
            </div>
          </div>
          <dl>
            <KV k="Specialty" v={ASTRONAUT.specialty} />
            <KV k="Age" v={ASTRONAUT.age} />
            <KV k="Height" v={`${ASTRONAUT.heightCm} cm`} />
            <KV k="Weight" v={`${ASTRONAUT.weightKg} kg`} />
          </dl>
        </section>

        <section className="panel p-5" aria-label="Mission details">
          <h2 className="mb-3 text-lg font-semibold">Mission details</h2>
          <dl>
            <KV k="Expedition" v={`${MISSION.name} (fictional)`} />
            <KV k="Station" v={MISSION.station} />
            <KV k="Launch" v={MISSION.launchDate} />
            <KV k="Crew" v={MISSION.crew} />
            <KV k="Orbit" v={MISSION.orbit} />
            <KV k="Clock" v="MET shown in the top bar is a demo value" />
          </dl>
        </section>
      </div>

      <div className="mt-8">
        <SectionHeader
          title="Personal baseline"
          description={`Your own reference values. Last calibrated ${formatDateTime(baseline.calibratedAt)}.`}
          right={
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (
                  window.confirm(
                    'Recalibrate your baseline from the last 7 days? This replaces your current reference values.',
                  )
                )
                  recalibrateBaseline()
              }}
            >
              <RefreshCw size={16} aria-hidden="true" /> Recalibrate from last 7 days
            </button>
          }
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            ['Reaction time', `${Math.round(baseline.reactionMs)} ms`],
            ['Memory accuracy', `${baseline.memoryAccuracy}%`],
            ['Attention score', `${baseline.attentionScore}`],
            ['Sleep', `${baseline.sleepHours} h`],
            ['Fatigue', `${baseline.fatigue}/10`],
            ['Stress', `${baseline.stress}/10`],
          ].map(([k, v]) => (
            <div key={k} className="panel p-3">
              <div className="label-mono">{k}</div>
              <div className="mt-1 font-mono text-xl">{v}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          Initial baseline = average of the first 14 simulated days. Recalibrating uses your most recent 7 days.
        </p>
      </div>

      <div className="mt-8">
        <SectionHeader title="Assessment history" description={`${history.length} sessions recorded. Newest first.`} />
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Assessment history</caption>
            <thead className="label-mono border-b border-white/10">
              <tr>
                <th className="p-3 font-normal">Date</th>
                <th className="p-3 font-normal">Test</th>
                <th className="p-3 font-normal">Score</th>
                <th className="p-3 font-normal">Key metric</th>
                <th className="p-3 font-normal">Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-white/5 last:border-0">
                  <td className="p-3 font-mono">{formatDateTime(a.timestamp)}</td>
                  <td className="p-3 capitalize">{a.type}</td>
                  <td className="p-3 font-mono">{a.score}</td>
                  <td className="p-3 font-mono text-muted">{keyMetric(a)}</td>
                  <td className="p-3">
                    <StatusBadge tone={a.source === 'user' ? 'nominal' : 'info'}>{a.source === 'user' ? 'You' : 'Simulated'}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {history.length > 15 && (
          <button type="button" className="btn btn-ghost mt-3" onClick={() => setShowAll((s) => !s)}>
            {showAll ? 'Show fewer' : `Show all ${history.length}`}
          </button>
        )}
      </div>

      <div className="mt-8">
        <SectionHeader title="Monitoring preferences" description="Saved automatically on this device." />
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="panel p-5" aria-label="Alert rules">
            <h3 className="mb-3 font-semibold">Alert rules</h3>
            <ul className="space-y-3">
              {RULES.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>{r.label}</span>
                  <Toggle
                    label={r.label}
                    checked={preferences.alertsEnabled[r.id]}
                    onChange={(v) => updatePreferences({ alertsEnabled: { ...preferences.alertsEnabled, [r.id]: v } })}
                  />
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-4">
              <Slider id="th-react" label="Reaction slower than baseline by" value={preferences.reactionThresholdPct} min={5} max={30} step={1} unit="%" onChange={(v) => updatePreferences({ reactionThresholdPct: v })} />
              <Slider id="th-mem" label="Memory accuracy drop of" value={preferences.memoryDropPoints} min={5} max={30} step={1} unit=" pts" onChange={(v) => updatePreferences({ memoryDropPoints: v })} />
              <Slider id="th-sleep" label="Sleep decrease of" value={preferences.sleepDropHours} min={0.25} max={2} step={0.25} unit=" h" onChange={(v) => updatePreferences({ sleepDropHours: v })} />
              <Slider id="th-fat" label="Fatigue increase of" value={preferences.fatigueRise} min={0.5} max={4} step={0.5} unit=" pts" onChange={(v) => updatePreferences({ fatigueRise: v })} />
            </div>
          </section>

          <section className="panel p-5" aria-label="Reminders and display">
            <h3 className="mb-3 font-semibold">Reminders and display</h3>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span>Daily check-in reminder</span>
              <Toggle label="Daily check-in reminder" checked={preferences.dailyReminder} onChange={(v) => updatePreferences({ dailyReminder: v })} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <label htmlFor="reminder-time">Reminder time</label>
              <input
                id="reminder-time"
                type="time"
                value={preferences.reminderTime}
                disabled={!preferences.dailyReminder}
                onChange={(e) => updatePreferences({ reminderTime: e.target.value })}
                className="rounded-lg border border-white/20 bg-navy px-3 py-1.5 font-mono disabled:opacity-40"
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span>Show “Simulated” labels on the overview</span>
              <Toggle label="Show simulated labels" checked={preferences.showDemoBadges} onChange={(v) => updatePreferences({ showDemoBadges: v })} />
            </div>
            <p className="mt-4 text-xs text-muted">Reminders are stored as preferences only; this prototype does not send notifications.</p>
          </section>
        </div>
      </div>

      <div className="panel mt-8 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h3 className="font-semibold">Reset demo data</h3>
          <p className="text-sm text-muted">Removes your sessions, check-ins and preferences, and restores the simulated 30-day history.</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost border-orange/60 text-orange"
          onClick={() => {
            if (window.confirm('Reset all demo data? Your recorded sessions and check-ins will be deleted.')) resetDemo()
          }}
        >
          <RotateCcw size={16} aria-hidden="true" /> Reset demo data
        </button>
      </div>

      <p className="mt-6 text-center font-mono text-xs text-muted">{DISCLAIMER}</p>
    </div>
  )
}
