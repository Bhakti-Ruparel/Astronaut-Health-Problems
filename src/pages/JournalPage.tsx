import { CheckCircle2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { MOOD_SCALE, SYMPTOMS } from '../data/constants'
import { PageTitle, SectionHeader } from '../components/ui/controls'
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
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="font-mono text-lg text-cyan">
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
      />
      {hint && (
        <div className="mt-1 flex justify-between font-mono text-[11px] text-muted">
          <span>{hint[0]}</span>
          <span>{hint[1]}</span>
        </div>
      )}
    </div>
  )
}

function Field({ children }: { children: ReactNode }) {
  return <div className="panel p-4">{children}</div>
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
        <Field>
          <Slider id="sleepHours" label="Sleep duration" value={sleepHours} min={0} max={12} step={0.5} unit=" h" onChange={touch(setSleepHours)} />
        </Field>
        <Field>
          <Slider id="sleepQuality" label="Sleep quality" value={sleepQuality} min={1} max={10} hint={['Poor', 'Excellent']} onChange={touch(setSleepQuality)} />
        </Field>
        <Field>
          <Slider id="fatigue" label="Fatigue level" value={fatigue} min={1} max={10} hint={['Fully rested', 'Exhausted']} onChange={touch(setFatigue)} />
        </Field>
        <Field>
          <Slider id="stress" label="Stress level" value={stress} min={1} max={10} hint={['Calm', 'Very stressed']} onChange={touch(setStress)} />
        </Field>

        <Field>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Mood</legend>
            <div role="radiogroup" aria-label="Mood" className="grid grid-cols-5 gap-2">
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
                    className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors ${
                      on ? 'border-cyan bg-cyan text-navy' : 'border-white/20 hover:border-cyan/60'
                    }`}
                  >
                    <Icon size={24} aria-hidden="true" />
                    {m.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </Field>

        <Field>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Symptoms today (optional)</legend>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => {
                const on = symptoms.includes(s.id)
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleSymptom(s.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      on ? 'border-orange bg-orange text-navy' : 'border-white/20 hover:border-orange/70'
                    }`}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </Field>

        <div className="panel p-4 lg:col-span-2">
          <label htmlFor="notes" className="mb-2 block text-sm font-medium">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            maxLength={500}
            rows={3}
            onChange={(e) => touch(setNotes)(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-navy p-3 text-sm placeholder:text-muted"
            placeholder="Anything worth remembering about today?"
          />
          <div className="mt-1 text-right font-mono text-[11px] text-muted">{notes.length}/500</div>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:col-span-2">
          <button type="submit" className="btn btn-primary">
            {existing || saved ? 'Update today’s check-in' : 'Save check-in'}
          </button>
          <p role="status" aria-live="polite" className="text-sm">
            {saved && (
              <span className="inline-flex items-center gap-2 text-ok">
                <CheckCircle2 size={18} aria-hidden="true" /> Check-in saved for today.
              </span>
            )}
          </p>
        </div>
      </form>

      <div className="mt-8">
        <SectionHeader title="Recent entries" description="Last 7 check-ins (seeded entries are simulated demo data)." />
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Recent health journal entries</caption>
            <thead className="label-mono border-b border-white/10">
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
                <tr key={e.id} className="border-b border-white/5 last:border-0">
                  <td className="p-3 font-mono">{formatDate(e.date)}</td>
                  <td className="p-3 font-mono">{e.sleepHours} h</td>
                  <td className="p-3 font-mono">{e.fatigue}/10</td>
                  <td className="p-3 font-mono">{e.stress}/10</td>
                  <td className="p-3">{MOOD_SCALE.find((m) => m.value === e.mood)?.label}</td>
                  <td className="p-3 text-muted">
                    {e.symptoms.length ? e.symptoms.map((id) => SYMPTOMS.find((s) => s.id === id)?.label).join(', ') : 'None'}
                  </td>
                  <td className="p-3 font-mono text-xs text-muted">{e.source === 'seed' ? 'Simulated' : 'You'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
