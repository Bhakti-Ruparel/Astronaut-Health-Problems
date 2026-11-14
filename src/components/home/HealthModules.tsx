import { Activity, Brain, Eye, Gauge, Grid3x3, Moon, Timer, Zap } from 'lucide-react'
import { MOOD_SCALE } from '../../data/constants'
import { delta } from '../../lib/metrics'
import { clamp, type DayPoint } from '../../lib/stats'
import type { Baseline, JournalEntry } from '../../types'
import { ModuleCard } from './ModuleCard'

export interface ModuleData {
  index: number | null
  baseline: Baseline
  series: {
    reaction: DayPoint[]
    memory: DayPoint[]
    attention: DayPoint[]
    sleep: DayPoint[]
    fatigue: DayPoint[]
    stress: DayPoint[]
  }
  lastReaction?: number
  lastMemory?: number
  lastAttention?: number
  latestJournal?: JournalEntry
}

const vals = (s: DayPoint[]) => s.map((p) => p.value)

export function HealthModules({ index, baseline, series, lastReaction, lastMemory, lastAttention, latestJournal }: ModuleData) {
  const mood = MOOD_SCALE.find((m) => m.value === latestJournal?.mood)
  const MoodIcon = mood?.icon
  return (
    <section aria-label="Health modules" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ModuleCard
        id="cognitive"
        label="Cognitive Health"
        icon={Brain}
        value={index ?? '–'}
        unit="/100"
        ring={index === null ? 0 : clamp(index, 0, 100)}
        description={
          index === null
            ? 'Complete an assessment to see how you compare with your baseline.'
            : 'Combined reaction, memory and attention results relative to your personal baseline.'
        }
        to="/assessment"
        tag="Measured"
        className="xl:col-span-2"
      />
      <ModuleCard
        id="reaction"
        label="Reaction Time"
        icon={Timer}
        value={lastReaction ? Math.round(lastReaction) : '–'}
        unit="ms"
        delta={lastReaction ? delta(lastReaction, baseline.reactionMs, ' ms', true) : undefined}
        description="Speed of response to a visual signal. Lower is faster."
        to="/assessment?test=reaction"
        tag="Measured"
        spark={vals(series.reaction)}
      />
      <ModuleCard
        id="memory"
        label="Memory"
        icon={Grid3x3}
        value={lastMemory !== undefined ? Math.round(lastMemory) : '–'}
        unit="%"
        delta={lastMemory !== undefined ? delta(lastMemory, baseline.memoryAccuracy, ' pts', false) : undefined}
        description="Digit-span recall accuracy across rounds."
        to="/assessment?test=memory"
        tag="Measured"
        spark={vals(series.memory)}
      />
      <ModuleCard
        id="attention"
        label="Attention"
        icon={Eye}
        value={lastAttention !== undefined ? Math.round(lastAttention) : '–'}
        unit="/100"
        delta={lastAttention !== undefined ? delta(lastAttention, baseline.attentionScore, ' pts', false) : undefined}
        description="Sustained focus: targets caught versus false alarms."
        to="/assessment?test=attention"
        tag="Measured"
        spark={vals(series.attention)}
      />
      <ModuleCard
        id="sleep"
        label="Sleep"
        icon={Moon}
        value={latestJournal ? latestJournal.sleepHours : '–'}
        unit="h"
        delta={latestJournal ? delta(latestJournal.sleepHours, baseline.sleepHours, ' h', false, true) : undefined}
        description="Hours slept last night, from your journal."
        to="/trends"
        tag="Self-reported"
        spark={vals(series.sleep)}
      />
      <ModuleCard
        id="fatigue"
        label="Fatigue"
        icon={Zap}
        value={latestJournal ? latestJournal.fatigue : '–'}
        unit="/10"
        delta={latestJournal ? delta(latestJournal.fatigue, baseline.fatigue, '', true, true) : undefined}
        description="How tired you feel. Lower is better."
        to="/trends"
        tag="Self-reported"
        spark={vals(series.fatigue)}
      />
      <ModuleCard
        id="stress"
        label="Stress and Mood"
        icon={Gauge}
        value={latestJournal ? latestJournal.stress : '–'}
        unit="/10"
        delta={latestJournal ? delta(latestJournal.stress, baseline.stress, '', true, true) : undefined}
        description={latestJournal ? `Latest check-in: ${latestJournal.date}.` : 'No check-in yet. Log one in the journal.'}
        to={latestJournal ? '/trends' : '/journal'}
        tag="Self-reported"
        spark={vals(series.stress)}
        secondary={
          mood && (
            <span className="inline-flex items-center gap-1.5">
              {MoodIcon ? <MoodIcon size={14} aria-hidden="true" /> : <Activity size={14} aria-hidden="true" />}
              Mood: {mood.label}
            </span>
          )
        }
      />
    </section>
  )
}
