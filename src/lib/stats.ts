import type { AssessmentResult, AssessmentType } from '../types'

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

/** Least-squares slope of values against their index (units per step). */
export function linearSlope(values: number[]): number {
  const n = values.length
  if (n < 2) return 0
  const xm = (n - 1) / 2
  const ym = mean(values)
  let num = 0
  let den = 0
  values.forEach((y, x) => {
    num += (x - xm) * (y - ym)
    den += (x - xm) ** 2
  })
  return den === 0 ? 0 : num / den
}

/** Percentage difference of value relative to base. */
export function pctDelta(value: number, base: number): number {
  if (!base) return 0
  return ((value - base) / base) * 100
}

export const lastN = <T,>(arr: T[], n: number): T[] => arr.slice(Math.max(0, arr.length - n))

export const round1 = (v: number) => Math.round(v * 10) / 10

/** Local YYYY-MM-DD for a Date or ISO string. */
export function dateKey(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function formatDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatMs = (ms: number) => `${Math.round(ms)} ms`

export function ofType(assessments: AssessmentResult[], type: AssessmentType): AssessmentResult[] {
  return assessments
    .filter((a) => a.type === type)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export interface DayPoint {
  date: string
  label: string
  value: number
}

/** Cutoff date key for a range of `days` days ending today (inclusive). */
export function cutoffKey(days: number, today = new Date()): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1))
  return dateKey(d)
}

/** One point per local day (mean when several), limited to the last `days` days. */
export function dailySeries<T extends { date: string }>(
  items: T[],
  metric: (item: T) => number | undefined,
  days: number,
): DayPoint[] {
  const cutoff = cutoffKey(days)
  const groups = new Map<string, number[]>()
  for (const it of items) {
    if (it.date < cutoff) continue
    const v = metric(it)
    if (v === undefined || Number.isNaN(v)) continue
    groups.set(it.date, [...(groups.get(it.date) ?? []), v])
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, vs]) => ({ date, label: formatDate(date), value: round1(mean(vs)) }))
}

/** Date key of the Monday that starts the week containing `key`. */
function weekStartKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7))
  return dateKey(dt)
}

/** Mean per Monday-start week. Labels read like "Wk of Mar 3". */
export function weeklySeries(points: DayPoint[]): DayPoint[] {
  const groups = new Map<string, number[]>()
  for (const p of points) {
    const k = weekStartKey(p.date)
    groups.set(k, [...(groups.get(k) ?? []), p.value])
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, vs]) => ({ date, label: `Wk of ${formatDate(date)}`, value: round1(mean(vs)) }))
}

export function bucketSeries(points: DayPoint[], mode: 'daily' | 'weekly'): DayPoint[] {
  return mode === 'weekly' ? weeklySeries(points) : points
}

export function assessmentSeries(
  assessments: AssessmentResult[],
  type: AssessmentType,
  metric: (a: AssessmentResult) => number | undefined,
  days: number,
): DayPoint[] {
  const dated = ofType(assessments, type).map((a) => ({ ...a, date: dateKey(a.timestamp) }))
  return dailySeries(dated, metric, days)
}
