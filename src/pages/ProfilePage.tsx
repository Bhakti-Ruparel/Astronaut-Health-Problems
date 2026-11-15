import { LogOut, RefreshCw, RotateCcw } from 'lucide-react'
import { Suspense, lazy, useState, type CSSProperties, type ReactNode } from 'react'
import { OrbitRings } from '../components/art'
import { PageTitle, SectionHeader, Toggle } from '../components/ui/controls'
import { DemoBadge, StatusBadge } from '../components/ui/StatusBadge'
import { ASTRONAUT, DISCLAIMER, MISSION } from '../data/constants'
import { ACCENTS } from '../lib/theme'
import { formatDateTime } from '../lib/stats'
import { useApp } from '../store/AppStore'
import { useAuth } from '../store/AuthStore'
import type { AlertRuleId, AssessmentResult } from '../types'

const Astronaut = lazy(() => import('../components/art/Astronaut').then((m) => ({ default: m.Astronaut })))

const RULES: { id: AlertRuleId; label: string }[] = [
  { id: 'reaction-slow', label: 'Reaction time slower than baseline' },
  { id: 'memory-decline', label: 'Memory accuracy declining' },
  { id: 'sleep-decrease', label: 'Sleep duration decreasing' },
  { id: 'fatigue-rising', label: 'Fatigue reports rising' },
]

function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/10 py-2.5 text-sm last:border-0">
      <dt className="text-muted">{k}</dt>
      <dd className="num text-right">{v}</dd>
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
      <div className="mb-2 flex justify-between gap-3 text-sm">
        <label htmlFor={id}>{label}</label>
        <span className="num font-semibold text-cyan-bright">
          {value}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--fill': `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
      />
    </div>
  )
}

export function ProfilePage() {
  const { assessments, baseline, preferences, updatePreferences, recalibrateBaseline, resetDemo } = useApp()
  const { user, signOut } = useAuth()
  const [showAll, setShowAll] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const history = [...assessments].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  const rows = showAll ? history : history.slice(0, 15)

  const baselineCards: { k: string; v: string; accent: string }[] = [
    { k: 'Reaction time', v: `${Math.round(baseline.reactionMs)} ms`, accent: ACCENTS.reaction.main },
    { k: 'Memory accuracy', v: `${baseline.memoryAccuracy}%`, accent: ACCENTS.memory.main },
    { k: 'Attention score', v: `${baseline.attentionScore}`, accent: ACCENTS.attention.main },
    { k: 'Sleep', v: `${baseline.sleepHours} h`, accent: ACCENTS.sleep.main },
    { k: 'Fatigue', v: `${baseline.fatigue}/10`, accent: ACCENTS.fatigue.main },
    { k: 'Stress', v: `${baseline.stress}/10`, accent: ACCENTS.stress.main },
  ]

  return (
    <div>
      <PageTitle
        title="Profile"
        subtitle="Astronaut profile, mission details, personal baseline and monitoring preferences."
        right={<DemoBadge label="Fictional sample profile" />}
      />

      <section className="glass mb-5 flex flex-wrap items-center justify-between gap-4 p-4 md:p-5" aria-label="Neon account">
        <div>
          <div className="label-mono mb-1">Neon account</div>
          <p className="font-medium">{user?.email}</p>
          <p className="mt-1 text-xs text-muted">Your app records are separated by this account on this browser.</p>
          {signOutError && <p className="mt-2 text-sm text-orange-200" role="alert">{signOutError}</p>}
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={signingOut}
          onClick={async () => {
            setSigningOut(true)
            setSignOutError(null)
            try {
              await signOut()
            } catch (error) {
              setSignOutError(error instanceof Error ? error.message : 'Could not sign out.')
            } finally {
              setSigningOut(false)
            }
          }}
        >
          <LogOut size={16} aria-hidden="true" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          className="glass glass-accent relative overflow-hidden p-5 md:p-7"
          style={{ '--accent': '#8b5cf6' } as CSSProperties}
          aria-label="Astronaut profile"
        >
          <div className="mb-4 flex items-center gap-5 sm:pr-28">
            <div className="relative h-28 w-28 shrink-0 md:h-32 md:w-32">
              <OrbitRings className="absolute inset-[-14%] h-[128%] w-[128%]" />
              <span className="absolute inset-[18%] flex items-center justify-center rounded-full border border-white/30 bg-linear-to-br from-orange to-pink text-xl font-bold text-void shadow-[0_0_30px_rgb(252_109_38/0.45)] md:text-2xl">
                {ASTRONAUT.initials}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-semibold">{ASTRONAUT.name}</h2>
              <p className="mb-2 text-sm text-muted">{ASTRONAUT.role}</p>
              <StatusBadge tone="info">Fictional</StatusBadge>
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute top-2 right-2 hidden h-36 w-28 opacity-90 sm:block">
              <Suspense fallback={null}>
                <Astronaut pose="mini" className="h-full w-full" />
              </Suspense>
            </div>
          </div>
          <dl>
            <KV k="Specialty" v={ASTRONAUT.specialty} />
            <KV k="Age" v={ASTRONAUT.age} />
            <KV k="Height" v={`${ASTRONAUT.heightCm} cm`} />
            <KV k="Weight" v={`${ASTRONAUT.weightKg} kg`} />
          </dl>
        </section>

        <section className="glass glass-accent p-5 md:p-7" style={{ '--accent': '#55c6e8' } as CSSProperties} aria-label="Mission details">
          <h2 className="mb-3 font-display text-xl font-semibold">Mission details</h2>
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <KV k="Expedition" v={`${MISSION.name} (fictional)`} />
            <KV k="Station" v={MISSION.station} />
            <KV k="Launch" v={MISSION.launchDate} />
            <KV k="Crew" v={MISSION.crew} />
            <KV k="Orbit" v={MISSION.orbit} />
            <KV k="Clock" v="MET in the top bar is a demo value" />
          </dl>
        </section>
      </div>

      <div className="mt-10">
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
          {baselineCards.map((c) => (
            <div key={c.k} className="glass glass-accent p-4" style={{ '--accent': c.accent } as CSSProperties}>
              <div className="label-mono">{c.k}</div>
              <div className="num mt-1 text-2xl font-semibold" style={{ color: c.accent }}>
                {c.v}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          Initial baseline = average of the first 14 simulated days. Recalibrating uses your most recent 7 days.
        </p>
      </div>

      <div className="mt-10">
        <SectionHeader title="Assessment history" description={`${history.length} sessions recorded. Newest first.`} />
        <div className="glass max-h-[34rem] overflow-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Assessment history</caption>
            <thead className="label-mono sticky top-0 border-b border-white/10 bg-midnight/95">
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
                <tr key={a.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="num p-3 whitespace-nowrap">{formatDateTime(a.timestamp)}</td>
                  <td className="p-3 capitalize">{a.type}</td>
                  <td className="num p-3">{a.score}</td>
                  <td className="num p-3 text-muted">{keyMetric(a)}</td>
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

      <div className="mt-10">
        <SectionHeader title="Monitoring preferences" description="Saved automatically on this device." />
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="glass glass-accent p-5 md:p-7" style={{ '--accent': '#a78bfa' } as CSSProperties} aria-label="Alert rules">
            <h3 className="mb-3 font-display text-lg font-semibold">Alert rules</h3>
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
            <div className="mt-6 space-y-5">
              <Slider id="th-react" label="Reaction slower than baseline by" value={preferences.reactionThresholdPct} min={5} max={30} step={1} unit="%" onChange={(v) => updatePreferences({ reactionThresholdPct: v })} />
              <Slider id="th-mem" label="Memory accuracy drop of" value={preferences.memoryDropPoints} min={5} max={30} step={1} unit=" pts" onChange={(v) => updatePreferences({ memoryDropPoints: v })} />
              <Slider id="th-sleep" label="Sleep decrease of" value={preferences.sleepDropHours} min={0.25} max={2} step={0.25} unit=" h" onChange={(v) => updatePreferences({ sleepDropHours: v })} />
              <Slider id="th-fat" label="Fatigue increase of" value={preferences.fatigueRise} min={0.5} max={4} step={0.5} unit=" pts" onChange={(v) => updatePreferences({ fatigueRise: v })} />
            </div>
          </section>

          <section className="glass glass-accent p-5 md:p-7" style={{ '--accent': '#34d399' } as CSSProperties} aria-label="Reminders and display">
            <h3 className="mb-3 font-display text-lg font-semibold">Reminders and display</h3>
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
                className="num min-h-10 rounded-xl border border-white/20 bg-void/60 px-3 py-1.5 disabled:opacity-40"
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

      <div className="glass glass-accent mt-10 flex flex-wrap items-center justify-between gap-4 p-5 md:p-7" style={{ '--accent': '#fc6d26' } as CSSProperties}>
        <div>
          <h3 className="font-display text-lg font-semibold">Reset demo data</h3>
          <p className="text-sm text-muted">Removes your sessions, check-ins and preferences, and restores the simulated 30-day history.</p>
        </div>
        <button
          type="button"
          className="btn btn-warn"
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
