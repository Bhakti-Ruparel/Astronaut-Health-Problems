import type { AlertItem, Baseline } from '../types'
import { mean, pctDelta, round1 } from './stats'

export interface MetricDelta {
  text: string
  /** Direction of change. */
  dir: 'up' | 'down' | 'flat'
  /** Whether this change is an improvement relative to baseline. */
  good: boolean
}

/** Change of `value` against `base`: percentage by default, absolute with unit when `absolute`. */
export function delta(value: number, base: number, unit: string, lowerBetter: boolean, absolute = false): MetricDelta {
  const diff = value - base
  const pct = pctDelta(value, base)
  const flat = Math.abs(pct) < 1
  const text = absolute
    ? `${diff > 0 ? '+' : ''}${round1(diff)}${unit}`
    : `${pct > 0 ? '+' : ''}${round1(pct)}%`
  return {
    text,
    dir: flat ? 'flat' : diff > 0 ? 'up' : 'down',
    good: flat || (lowerBetter ? diff < 0 : diff > 0),
  }
}

/** Cognitive index: mean of latest results relative to the personal baseline (100 = at baseline). */
export function cognitiveIndex(
  baseline: Pick<Baseline, 'reactionMs' | 'memoryAccuracy' | 'attentionScore'>,
  last: { reaction?: number; memory?: number; attention?: number },
): number | null {
  const ratios: number[] = []
  if (last.reaction) ratios.push((baseline.reactionMs / last.reaction) * 100)
  if (last.memory !== undefined) ratios.push((last.memory / baseline.memoryAccuracy) * 100)
  if (last.attention !== undefined) ratios.push((last.attention / baseline.attentionScore) * 100)
  return ratios.length ? Math.round(mean(ratios)) : null
}

export type HealthStatus = 'nominal' | 'watch' | 'attention'

export function healthStatus(alerts: AlertItem[]): HealthStatus {
  const top = alerts[0]?.severity
  return top === 'high' ? 'attention' : top ? 'watch' : 'nominal'
}

export const STATUS_TEXT: Record<HealthStatus, string> = {
  nominal: 'Nominal',
  watch: 'Watch',
  attention: 'Needs attention',
}

export const STATUS_RING: Record<HealthStatus, string> = {
  nominal: '#4ade80',
  watch: '#FC6D26',
  attention: '#fca5a5',
}

/** Plain-language health sentence shared by the Hero and the overview. */
export function healthSentence(index: number | null, alertCount: number): string {
  const a =
    index === null
      ? 'Complete a cognitive assessment to compare with your baseline.'
      : `Your latest cognitive results are at ${index}% of your personal baseline (100 = at baseline).`
  const b =
    alertCount > 0
      ? `${alertCount} monitoring indicator${alertCount > 1 ? 's' : ''} deserve${alertCount > 1 ? '' : 's'} attention.`
      : 'No monitoring indicators currently exceed your thresholds.'
  return `${a} ${b}`
}
