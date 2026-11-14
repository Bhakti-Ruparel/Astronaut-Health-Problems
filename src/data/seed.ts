import type { AlertRuleId, AssessmentResult, Baseline, JournalEntry, Preferences, SymptomId } from '../types'
import { computeBaseline } from '../lib/baseline'
import { attentionScore, memoryScore, reactionScore } from '../lib/scoring'
import { clamp, dateKey, round1 } from '../lib/stats'

export function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const DEFAULT_PREFERENCES: Preferences = {
  reactionThresholdPct: 10,
  memoryDropPoints: 10,
  sleepDropHours: 0.75,
  fatigueRise: 1.5,
  alertsEnabled: {
    'reaction-slow': true,
    'memory-decline': true,
    'sleep-decrease': true,
    'fatigue-rising': true,
  } satisfies Record<AlertRuleId, boolean>,
  dailyReminder: true,
  reminderTime: '09:00',
  showDemoBadges: true,
}

const DAYS = 30

/** Generates 30 simulated days ending yesterday (today is left empty so the demo flow is live). */
export function generateSeed(today: Date): {
  assessments: AssessmentResult[]
  journal: JournalEntry[]
  baseline: Baseline
} {
  const rand = mulberry32(20250114)
  const noise = (amp: number) => (rand() * 2 - 1) * amp
  const assessments: AssessmentResult[] = []
  const journal: JournalEntry[] = []

  for (let i = 0; i < DAYS; i++) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (DAYS - i))
    const key = dateKey(day)
    const ts = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0, 0).toISOString()
    const late = i >= 23
    const mid = i >= 14 && i < 23

    // Reaction (every day)
    const reaction = late
      ? 348 + (i - 23) * 3 + noise(5)
      : mid
        ? 305 + (i - 14) * 2 + noise(8)
        : 305 + noise(15)
    const rMs = Math.round(reaction)
    assessments.push({
      id: `seed-r-${i}`,
      type: 'reaction',
      timestamp: ts,
      source: 'seed',
      reactionMs: rMs,
      bestMs: Math.round(rMs - 25 - rand() * 15),
      prematureCount: rand() < 0.2 ? 1 : 0,
      score: reactionScore(rMs),
    })

    // Memory (most days)
    if (i % 4 !== 2) {
      const acc = round1(clamp(86 + noise(4) - (i >= 14 ? (i - 14) * 0.4 : 0), 40, 100))
      const maxLength = Math.round(5 + (acc / 100) * 3)
      assessments.push({
        id: `seed-m-${i}`,
        type: 'memory',
        timestamp: new Date(new Date(ts).getTime() + 5 * 60000).toISOString(),
        source: 'seed',
        accuracy: acc,
        maxLength,
        completionMs: Math.round(24000 + noise(3000)),
        score: memoryScore(acc, maxLength),
      })
    }

    // Attention (most days)
    if (i % 5 !== 4) {
      const targets = 11
      const rate = clamp(0.9 + noise(0.07) - (i >= 14 ? (i - 14) * 0.004 : 0), 0.5, 1)
      const hits = Math.round(targets * rate)
      const falseAlarms = rand() < 0.3 ? 1 : 0
      assessments.push({
        id: `seed-a-${i}`,
        type: 'attention',
        timestamp: new Date(new Date(ts).getTime() + 10 * 60000).toISOString(),
        source: 'seed',
        hits,
        misses: targets - hits,
        falseAlarms,
        targets,
        meanHitMs: Math.round(420 + noise(40)),
        score: attentionScore(hits, targets, falseAlarms),
      })
    }

    // Journal (every day)
    const t = late ? i - 23 : 0
    const sleep = late ? 7.4 - t * 0.23 + noise(0.08) : mid ? 7.2 + noise(0.3) : 7.3 + noise(0.4)
    const fatigue = late ? 3 + t * 0.67 + noise(0.3) : mid ? 3.3 + noise(0.8) : 3 + noise(1)
    const stress = late ? 3.5 + t * 0.25 + noise(0.5) : 3 + noise(1)
    const symptoms: SymptomId[] = []
    if (rand() < (late ? 0.55 : 0.12)) symptoms.push('eyeStrain')
    if (rand() < (late ? 0.4 : 0.08)) symptoms.push('headache')
    if (rand() < 0.1) symptoms.push('congestion')
    journal.push({
      id: `seed-j-${i}`,
      date: key,
      sleepHours: round1(sleep),
      sleepQuality: Math.round(clamp(late ? 6.5 - t * 0.25 + noise(0.5) : 7 + noise(1), 1, 10)),
      fatigue: Math.round(clamp(fatigue, 1, 10)),
      stress: Math.round(clamp(stress, 1, 10)),
      mood: late ? 3 : 4,
      symptoms,
      notes: '',
      source: 'seed',
    })
  }

  const first14 = journal[0].date
  const day14 = journal[13].date
  const baseline = computeBaseline(assessments, journal, first14, day14)
  return { assessments, journal, baseline }
}
