import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BaselineChart, TOOLTIP_STYLE } from '../components/ui/BaselineChart'
import { ChartCard, EmptyChart } from '../components/ui/ChartCard'
import { PageTitle, SectionHeader, SegmentedControl } from '../components/ui/controls'
import { StatusBadge } from '../components/ui/StatusBadge'
import {
  assessmentSeries,
  bucketSeries,
  cutoffKey,
  dailySeries,
  dateKey,
  formatDate,
  pctDelta,
  round1,
  type DayPoint,
} from '../lib/stats'
import { useApp } from '../store/AppStore'

type Mode = 'daily' | 'weekly'
const WEEKLY_EMPTY = 'Weekly view needs at least two weeks of data; try 30 days'

function Latest({ series, base, unit, lowerBetter }: { series: DayPoint[]; base: number; unit: string; lowerBetter?: boolean }) {
  const last = series.at(-1)
  if (!last) return null
  const pct = pctDelta(last.value, base)
  const worse = lowerBetter ? pct > 3 : pct < -3
  return (
    <div className="num text-right font-mono text-xs">
      <div className="text-base text-white">
        {last.value}
        {unit}
      </div>
      <div className={worse ? 'text-orange' : 'text-muted'}>
        {pct > 0 ? '+' : ''}
        {round1(pct)}% vs baseline
      </div>
    </div>
  )
}

/** Shift a YYYY-MM-DD key forward by `days` days. */
function shiftKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return dateKey(new Date(y, m - 1, d + days))
}

export function TrendsPage() {
  const { assessments, journal, baseline } = useApp()
  const [days, setDays] = useState(14)
  const [mode, setMode] = useState<Mode>('daily')

  const changeMode = (m: Mode) => {
    setMode(m)
    if (m === 'weekly') setDays(30)
  }

  const daily = useMemo(
    () => ({
      reaction: assessmentSeries(assessments, 'reaction', (a) => a.reactionMs, days),
      memory: assessmentSeries(assessments, 'memory', (a) => a.accuracy, days),
      attention: assessmentSeries(assessments, 'attention', (a) => a.score, days),
      sleep: dailySeries(journal, (j) => j.sleepHours, days),
      fatigue: dailySeries(journal, (j) => j.fatigue, days),
      stress: dailySeries(journal, (j) => j.stress, days),
    }),
    [assessments, journal, days],
  )

  const s = useMemo(
    () => ({
      reaction: bucketSeries(daily.reaction, mode),
      memory: bucketSeries(daily.memory, mode),
      attention: bucketSeries(daily.attention, mode),
      sleep: bucketSeries(daily.sleep, mode),
      fatigue: bucketSeries(daily.fatigue, mode),
      stress: bucketSeries(daily.stress, mode),
    }),
    [daily, mode],
  )

  // Comparison (a): latest measured value as % difference from baseline, positive = better.
  const diffs = useMemo(() => {
    const rows: { name: string; value: number; note: string }[] = []
    const lr = daily.reaction.at(-1)
    const lm = daily.memory.at(-1)
    const la = daily.attention.at(-1)
    if (lr) rows.push({ name: 'Reaction time', value: round1(-pctDelta(lr.value, baseline.reactionMs)), note: `${lr.value} ms vs ${baseline.reactionMs} ms (faster is better)` })
    if (lm) rows.push({ name: 'Memory accuracy', value: round1(pctDelta(lm.value, baseline.memoryAccuracy)), note: `${lm.value}% vs ${baseline.memoryAccuracy}%` })
    if (la) rows.push({ name: 'Attention score', value: round1(pctDelta(la.value, baseline.attentionScore)), note: `${la.value} vs ${baseline.attentionScore}` })
    return rows
  }, [daily, baseline])

  // Comparison (b): reaction time this period vs the previous period of equal length (daily, aligned by day offset).
  const periods = useMemo(() => {
    const all = assessmentSeries(assessments, 'reaction', (a) => a.reactionMs, days * 2)
    const cut = cutoffKey(days)
    const current = all.filter((p) => p.date >= cut)
    const previous = all
      .filter((p) => p.date < cut)
      .map((p) => {
        const date = shiftKey(p.date, days)
        return { date, label: formatDate(date), value: p.value }
      })
    return { current, previous }
  }, [assessments, days])

  const emptyMsg = mode === 'weekly' ? WEEKLY_EMPTY : undefined
  const measured = <StatusBadge tone="measured">Measured</StatusBadge>
  const self = <StatusBadge tone="self">Self-reported</StatusBadge>
  const diffMax = Math.max(10, Math.ceil(Math.max(...diffs.map((d) => Math.abs(d.value)), 0) / 5) * 5)

  return (
    <div>
      <PageTitle
        title="Health Trends"
        subtitle="Mission telemetry. Dashed lines show your personal baseline; shaded bands show the typical range around it."
        right={
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedControl
              label="Resolution"
              value={mode}
              onChange={changeMode}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
              ]}
            />
            <SegmentedControl
              label="Time range"
              value={days}
              onChange={setDays}
              options={[
                { value: 7, label: '7 days' },
                { value: 14, label: '14 days' },
                { value: 30, label: '30 days' },
              ]}
            />
          </div>
        }
      />
      <p className="mb-6 -mt-3 flex items-center gap-2 font-mono text-xs text-muted">
        <span className="pulse-dot" aria-hidden="true" />
        Simulated demo history merged with your sessions
      </p>

      <SectionHeader
        title="Measured cognitive performance"
        description="Objective results from the assessments you complete."
        right={measured}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Reaction time"
          subtitle={`Milliseconds, lower is faster${mode === 'weekly' ? ' (weekly mean)' : ''}`}
          badge={measured}
          right={<Latest series={s.reaction} base={baseline.reactionMs} unit=" ms" lowerBetter />}
        >
          <BaselineChart
            data={s.reaction}
            name="Reaction time"
            unit="ms"
            baseline={baseline.reactionMs}
            band={[baseline.reactionMs * 0.9, baseline.reactionMs * 1.1]}
            emptyMessage={emptyMsg}
          />
        </ChartCard>
        <ChartCard
          title="Memory accuracy"
          subtitle={`Percent of digits recalled in position${mode === 'weekly' ? ' (weekly mean)' : ''}`}
          badge={measured}
          right={<Latest series={s.memory} base={baseline.memoryAccuracy} unit="%" />}
        >
          <BaselineChart
            data={s.memory}
            name="Memory accuracy"
            unit="%"
            color="#7de3ff"
            baseline={baseline.memoryAccuracy}
            band={[baseline.memoryAccuracy - 8, baseline.memoryAccuracy + 8]}
            domain={[40, 100]}
            emptyMessage={emptyMsg}
          />
        </ChartCard>
        <div className="xl:col-span-2">
          <ChartCard
            title="Attention performance"
            subtitle={`Score 0-100 (hit rate minus false-alarm penalty)${mode === 'weekly' ? ', weekly mean' : ''}`}
            badge={measured}
            right={<Latest series={s.attention} base={baseline.attentionScore} unit="" />}
          >
            <BaselineChart
              data={s.attention}
              name="Attention score"
              color="#b39bff"
              baseline={baseline.attentionScore}
              band={[baseline.attentionScore - 8, baseline.attentionScore + 8]}
              domain={[0, 100]}
              emptyMessage={emptyMsg}
            />
          </ChartCard>
        </div>

        <ChartCard
          title="Measured vs baseline"
          subtitle="Latest value as % difference from your baseline. Positive is better (reaction time is inverted: faster is positive)."
          badge={measured}
          height={220}
        >
          {diffs.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={diffs.map((d) => ({ ...d, label: `${d.name} ${d.value > 0 ? '+' : ''}${d.value}%` }))}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
              >
                <CartesianGrid stroke="rgba(244,247,250,0.09)" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[-diffMax, diffMax]}
                  tick={{ fill: '#a9b8d0', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(244,247,250,0.25)' }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis type="category" dataKey="label" width={120} tick={{ fill: '#F4F7FA', fontSize: 12 }} tickLine={false} axisLine={false} />
                <ReferenceLine x={0} stroke="#F4F7FA" strokeDasharray="5 4" strokeOpacity={0.7} />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  formatter={(v, _n, item) => [`${Number(v) > 0 ? '+' : ''}${v}% (${(item?.payload as { note: string }).note})`, 'vs baseline']}
                />
                <Bar dataKey="value" name="vs baseline" radius={6} isAnimationActive={false} barSize={22}>
                  {diffs.map((d) => (
                    <Cell key={d.name} fill={d.value >= -3 ? '#4ade80' : '#FC6D26'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard
          title="This period vs previous period"
          subtitle={`Reaction time, last ${days} days against the ${days} days before (shifted onto the same dates)`}
          badge={measured}
          height={220}
        >
          <BaselineChart
            data={periods.current}
            name="This period"
            unit="ms"
            baseline={baseline.reactionMs}
            extra={{ data: periods.previous, name: 'Previous period', color: '#b39bff' }}
          />
        </ChartCard>
      </div>

      <div className="mt-10">
        <SectionHeader
          title="Self-reported"
          description="Values you enter in the Health Journal. They reflect how you feel, not a measurement."
          right={self}
        />
        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard
            title="Sleep duration"
            subtitle={`Hours per night${mode === 'weekly' ? ' (weekly mean)' : ''}`}
            badge={self}
            right={<Latest series={s.sleep} base={baseline.sleepHours} unit=" h" />}
          >
            <BaselineChart
              data={s.sleep}
              name="Sleep"
              unit="h"
              color="#FC6D26"
              baseline={baseline.sleepHours}
              band={[baseline.sleepHours - 0.75, baseline.sleepHours + 0.75]}
              domain={[4, 10]}
              emptyMessage={emptyMsg}
            />
          </ChartCard>
          <ChartCard title="Fatigue and stress" subtitle="1-10 scale, lower is better" badge={self}>
            <BaselineChart
              data={s.fatigue}
              name="Fatigue"
              unit="/10"
              color="#FC6D26"
              baseline={baseline.fatigue}
              domain={[1, 10]}
              extra={{ data: s.stress, name: 'Stress', color: '#b39bff', baseline: baseline.stress }}
              emptyMessage={emptyMsg}
            />
          </ChartCard>
        </div>
        <p className="mt-3 font-mono text-xs text-muted">
          Orange line: fatigue. Violet line: stress. Dashed lines: your baselines. Simulated demo data merged with your entries.
        </p>
      </div>
    </div>
  )
}
