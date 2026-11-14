import type { AlertItem, AssessmentResult, Baseline, JournalEntry, Preferences } from '../types'
import { lastN, linearSlope, mean, ofType, pctDelta, round1 } from './stats'

const SEVERITY_ORDER = { high: 0, moderate: 1, info: 2 } as const

export function computeAlerts(
  assessments: AssessmentResult[],
  journal: JournalEntry[],
  baseline: Baseline,
  prefs: Preferences,
): AlertItem[] {
  const out: AlertItem[] = []
  const journalSorted = [...journal].sort((a, b) => a.date.localeCompare(b.date))

  // 1. Reaction time slower than baseline
  if (prefs.alertsEnabled['reaction-slow']) {
    const recent = lastN(ofType(assessments, 'reaction'), 5).filter((a) => a.reactionMs !== undefined)
    if (recent.length >= 4) {
      const ms = recent.map((a) => a.reactionMs as number)
      const limit = baseline.reactionMs * (1 + prefs.reactionThresholdPct / 100)
      const slow = ms.filter((v) => v >= limit).length
      if (slow >= recent.length - 1) {
        const pct = pctDelta(mean(ms), baseline.reactionMs)
        out.push({
          id: 'reaction-slow',
          severity: pct >= 20 ? 'high' : 'moderate',
          title: 'Reaction time is consistently slower than your baseline',
          explanation: `${slow} of your last ${recent.length} reaction sessions were at least ${prefs.reactionThresholdPct}% slower than your personal baseline. This is a possible change that deserves attention; many everyday factors, such as sleep or workload, can influence it.`,
          metrics: [
            { label: 'Recent mean', value: `${Math.round(mean(ms))} ms` },
            { label: 'Baseline', value: `${Math.round(baseline.reactionMs)} ms` },
            { label: 'Difference', value: `+${round1(pct)}%` },
          ],
          recommendation:
            'Review recent sleep and workload, repeat the reaction test after rest, and share the trend with your flight surgeon if it persists.',
          firedAt: recent[recent.length - 1].timestamp,
        })
      }
    }
  }

  // 2. Memory accuracy declining
  if (prefs.alertsEnabled['memory-decline']) {
    const recent = lastN(ofType(assessments, 'memory'), 4).filter((a) => a.accuracy !== undefined)
    if (recent.length >= 4) {
      const acc = recent.map((a) => a.accuracy as number)
      const drop = acc[0] - acc[acc.length - 1]
      const steps = acc.slice(1).filter((v, i) => v < acc[i]).length
      if (linearSlope(acc) < 0 && steps >= 2 && drop >= prefs.memoryDropPoints) {
        out.push({
          id: 'memory-decline',
          severity: drop >= 20 ? 'high' : 'moderate',
          title: 'Memory accuracy has declined over several sessions',
          explanation: `Accuracy fell by ${round1(drop)} points across your last ${recent.length} memory sessions. This is a monitoring indicator only, and short-term variation is common.`,
          metrics: [
            { label: 'First of last 4', value: `${round1(acc[0])}%` },
            { label: 'Latest', value: `${round1(acc[acc.length - 1])}%` },
            { label: 'Baseline', value: `${round1(baseline.memoryAccuracy)}%` },
          ],
          recommendation:
            'Retake the memory test in a quiet setting, note any distractions, and consider a short rest before the next session.',
          firedAt: recent[recent.length - 1].timestamp,
        })
      }
    }
  }

  // 3. Sleep decreasing
  if (prefs.alertsEnabled['sleep-decrease']) {
    const recent = lastN(journalSorted, 7)
    if (recent.length >= 7) {
      const h = recent.map((e) => e.sleepHours)
      const last3 = mean(h.slice(-3))
      const prev4 = mean(h.slice(0, 4))
      const lowerThanPrev = prev4 - last3 >= prefs.sleepDropHours
      const lowerThanBase = baseline.sleepHours - last3 >= prefs.sleepDropHours
      if (linearSlope(h) < -0.1 && (lowerThanPrev || lowerThanBase)) {
        out.push({
          id: 'sleep-decrease',
          severity: last3 < 5.5 ? 'high' : 'moderate',
          title: 'Sleep duration has decreased over recent days',
          explanation: `Your reported sleep averaged ${round1(last3)} h over the last 3 days, compared with ${round1(prev4)} h earlier in the week. This is a possible change that deserves attention.`,
          metrics: [
            { label: 'Last 3 days', value: `${round1(last3)} h` },
            { label: 'Earlier 4 days', value: `${round1(prev4)} h` },
            { label: 'Baseline', value: `${round1(baseline.sleepHours)} h` },
          ],
          recommendation:
            'Protect your scheduled sleep period, reduce light and noise in the sleep station, and log how rested you feel in the journal.',
          firedAt: recent[recent.length - 1].date,
        })
      }
    }
  }

  // 4. Fatigue rising
  if (prefs.alertsEnabled['fatigue-rising']) {
    const recent = lastN(journalSorted, 7)
    if (recent.length >= 7) {
      const f = recent.map((e) => e.fatigue)
      const last3 = mean(f.slice(-3))
      if (linearSlope(f) > 0.15 && last3 >= baseline.fatigue + prefs.fatigueRise) {
        out.push({
          id: 'fatigue-rising',
          severity: last3 >= 8 ? 'high' : 'moderate',
          title: 'Self-reported fatigue has been rising',
          explanation: `Your fatigue ratings averaged ${round1(last3)} / 10 over the last 3 days, up from your baseline of ${round1(baseline.fatigue)}. This reflects your own reports and is not a medical finding.`,
          metrics: [
            { label: 'Last 3 days', value: `${round1(last3)} / 10` },
            { label: 'Baseline', value: `${round1(baseline.fatigue)} / 10` },
            { label: 'Trend', value: `${linearSlope(f) > 0 ? '+' : ''}${round1(linearSlope(f))} / day` },
          ],
          recommendation:
            'Consider adjusting the work schedule, adding a short rest block, and discuss persistent fatigue with the crew medical officer.',
          firedAt: recent[recent.length - 1].date,
        })
      }
    }
  }

  return out.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
}
