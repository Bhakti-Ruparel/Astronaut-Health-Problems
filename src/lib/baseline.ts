import type { AssessmentResult, Baseline, JournalEntry } from '../types'
import { dateKey, mean, round1 } from './stats'

export const DEFAULT_BASELINE: Baseline = {
  reactionMs: 300,
  memoryAccuracy: 85,
  attentionScore: 80,
  sleepHours: 7.2,
  fatigue: 3,
  stress: 3,
  calibratedAt: new Date(0).toISOString(),
}

/** Mean of measured and self-reported values between two date keys (inclusive). Missing groups fall back to `fallback`. */
export function computeBaseline(
  assessments: AssessmentResult[],
  journal: JournalEntry[],
  fromKey: string,
  toKey: string,
  fallback: Baseline = DEFAULT_BASELINE,
): Baseline {
  const inRange = (k: string) => k >= fromKey && k <= toKey
  const a = assessments.filter((x) => inRange(dateKey(x.timestamp)))
  const j = journal.filter((x) => inRange(x.date))
  const avg = (vals: (number | undefined)[], fb: number) => {
    const v = vals.filter((x): x is number => typeof x === 'number')
    return v.length ? round1(mean(v)) : round1(fb)
  }
  return {
    reactionMs: Math.round(
      avg(a.filter((x) => x.type === 'reaction').map((x) => x.reactionMs), fallback.reactionMs),
    ),
    memoryAccuracy: avg(a.filter((x) => x.type === 'memory').map((x) => x.accuracy), fallback.memoryAccuracy),
    attentionScore: avg(a.filter((x) => x.type === 'attention').map((x) => x.score), fallback.attentionScore),
    sleepHours: avg(j.map((x) => x.sleepHours), fallback.sleepHours),
    fatigue: avg(j.map((x) => x.fatigue), fallback.fatigue),
    stress: avg(j.map((x) => x.stress), fallback.stress),
    calibratedAt: new Date().toISOString(),
  }
}
