import { Activity, Brain as BrainIcon, CheckCircle2, Moon, Zap, type LucideIcon } from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { EmptyArt } from '../components/art'
import { MOOD_SCALE, SYMPTOMS } from '../data/constants'
import { PageTitle, SectionHeader } from '../components/ui/controls'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/StatusBadge'
import { dateKey, formatDate } from '../lib/stats'
import { useApp } from '../store/AppStore'
import type { SymptomId } from '../types'

function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  hint,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  hint?: [string, string]
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-10 pr-10">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="num text-lg font-semibold text-cyan-bright">
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
        aria-valuetext={`${value}${unit}`}
        style={{ '--fill': `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
      />
      {hint && (
        <div className="mt-1.5 flex justify-between text-[11px] text-muted">
          <span>{hint[0]}</span>
          <span>{hint[1]}</span>
        </div>
      )}
    </div>
  )
}

function Field({ children, accent, Icon }: { children: ReactNode; accent: string; Icon?: LucideIcon }) {
  return (
    <div className="glass glass-accent relative p-5" style={{ '--accent': accent } as CSSProperties}>
      {Icon && (
        <span
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5"
          style={{ color: accent }}
          aria-hidden="true"
        >
          <Icon size={16} />
        </span>
      )}
      {children}
    </div>
  )
}

export function JournalPage() {
  const { journal, saveJournalEntry } = useApp()
  const today = dateKey(new Date())
  const existing = journal.find((j) => j.date === today)

  const [sleepHours, setSleepHours] = useState(existing?.sleepHours ?? 7)
  const [sleepQuality, setSleepQuality] = useState(existing?.sleepQuality ?? 6)
  const [fatigue, setFatigue] = useState(existing?.fatigue ?? 4)
  const [stress, setStress] = useState(existing?.stress ?? 4)
  const [mood, setMood] = useState(existing?.mood ?? 3)
  const [symptoms, setSymptoms] = useState<SymptomId[]>(existing?.symptoms ?? [])
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [saved, setSaved] = useState(false)

  const toggleSymptom = (id: SymptomId) => {
    setSaved(false)
    setSymptoms((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }
  const touch = <T,>(setter: (v: T) => void) => (v: T) => {
    setSaved(false)
    setter(v)
  }

  const recent = [...journal].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7)

  return (
    <div>
      <PageTitle
        title="Health Journal"
        subtitle="A daily check-in that takes under a minute. These are self-reported values and are kept separate from measured cognitive results."
        right={<StatusBadge tone="self">Self-reported</StatusBadge>}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          saveJournalEntry({ sleepHours, sleepQuality, fatigue, stress, mood, symptoms, notes: notes.trim() })
          setSaved(true)
        }}
        className="grid gap-4 lg:grid-cols-2"
      >
        <Field accent="#818cf8" Icon={Moon}>
          <Slider id="sleepHours" label="Sleep duration" value={sleepHours} min={0} max={12} step={0.5} unit=" h" onChange={touch(setSleepHours)} />
        </Field>
        <Field accent="#a78bfa" Icon={BrainIcon}>
          <Slider id="sleepQuality" label="Sleep quality" value={sleepQuality} min={1} max={10} hint={['Poor', 'Excellent']} onChange={touch(setSleepQuality)} />
        </Field>
        <Field accent="#fc6d26" Icon={Zap}>
          <Slider id="fatigue" label="Fatigue level" value={fatigue} min={1} max={10} hint={['Fully rested', 'Exhausted']} onChange={touch(setFatigue)} />
        </Field>
        <Field accent="#34d399" Icon={Activity}>
          <Slider id="stress" label="Stress level" value={stress} min={1} max={10} hint={['Calm', 'Very stressed']} onChange={touch(setStress)} />
        </Field>

        <Field accent="#7de3ff">
          <fieldset>
            <legend className="mb-3 text-sm font-medium">Mood</legend>
            <div role="radiogroup" aria-label="Mood" className="grid grid-cols-5 gap-1.5 sm:gap-3">
              {MOOD_SCALE.map((m) => {
                const Icon = m.icon
                const on = mood === m.value
                return (
                  <button
                    key={m.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => touch(setMood)(m.value)}
                    className="group flex min-w-0 flex-col items-center gap-1.5 text-[11px] sm:text-xs"
                  >
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-full border transition-[background-color,border-color,box-shadow,transform] group-hover:-translate-y-0.5 sm:h-14 sm:w-14 ${
                        on
                          ? 'border-cyan-bright bg-linear-to-br from-cyan to-violet text-void shadow-[0_0_22px_rgb(125_227_255/0.55)]'
                          : 'border-white/20 bg-white/5 text-white group-hover:border-cyan/70'
                      }`}
                    >
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <span className={on ? 'font-semibold text-white' : 'text-muted'}>{m.label}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>
        </Field>

        <Field accent="#f472b6">
          <fieldset>
            <legend className="mb-3 text-sm font-medium">Symptoms today (optional)</legend>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => {
                const on = symptoms.includes(s.id)
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleSymptom(s.id)}
                    className={`min-h-10 rounded-full border px-4 py-1.5 text-sm transition-[background-color,border-color,box-shadow] ${
                      on
                        ? 'border-orange bg-orange text-void shadow-[0_0_16px_rgb(252_109_38/0.55)]'
                        : 'border-white/20 bg-white/5 hover:border-orange/70'
                    }`}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </Field>

        <div className="glass glass-accent p-5 lg:col-span-2" style={{ '--accent': '#55c6e8' } as CSSProperties}>
          <label htmlFor="notes" className="mb-2 block text-sm font-medium">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            maxLength={500}
            rows={3}
            onChange={(e) => touch(setNotes)(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-void/60 p-3 text-sm placeholder:text-muted"
            placeholder="Anything worth remembering about today?"
          />
          <div className="num mt-1 text-right text-[11px] text-muted">{notes.length}/500</div>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:col-span-2">
          <button type="submit" className="btn btn-primary">
            {existing || saved ? 'Update today’s check-in' : 'Save check-in'}
          </button>
          <p role="status" aria-live="polite" className="text-sm">
            {saved && (
              <span className="glass fade-in inline-flex items-center gap-2 rounded-full border-ok/50 px-4 py-2 text-ok shadow-[0_0_22px_rgb(74_222_128/0.3)]">
                <CheckCircle2 size={18} aria-hidden="true" /> Check-in saved for today.
              </span>
            )}
          </p>
        </div>
      </form>

      <div className="mt-10">
        <SectionHeader title="Recent entries" description="Last 7 check-ins (seeded entries are simulated demo data)." />
        {recent.length === 0 ? (
          <EmptyState
            art={<EmptyArt scene="no-data" />}
            title="No check-ins yet"
            body="Save today’s check-in above and it will appear here."
          />
        ) : (
          <div className="glass overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Recent health journal entries</caption>
              <thead className="label-mono border-b border-white/10 bg-white/5">
                <tr>
                  <th className="p-3 font-normal">Date</th>
                  <th className="p-3 font-normal">Sleep</th>
                  <th className="p-3 font-normal">Fatigue</th>
                  <th className="p-3 font-normal">Stress</th>
                  <th className="p-3 font-normal">Mood</th>
                  <th className="p-3 font-normal">Symptoms</th>
                  <th className="p-3 font-normal">Source</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((e) => (
                  <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="num p-3 whitespace-nowrap">{formatDate(e.date)}</td>
                    <td className="num p-3">{e.sleepHours} h</td>
                    <td className="num p-3">{e.fatigue}/10</td>
                    <td className="num p-3">{e.stress}/10</td>
                    <td className="p-3">{MOOD_SCALE.find((m) => m.value === e.mood)?.label}</td>
                    <td className="p-3 text-muted">
                      {e.symptoms.length ? e.symptoms.map((id) => SYMPTOMS.find((s) => s.id === id)?.label).join(', ') : 'None'}
                    </td>
                    <td className="p-3">
                      <StatusBadge tone={e.source === 'seed' ? 'info' : 'nominal'}>{e.source === 'seed' ? 'Simulated' : 'You'}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
