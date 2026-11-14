import { useMemo, useState } from 'react'
import { BaselineChart } from '../components/ui/BaselineChart'
import { ChartCard } from '../components/ui/ChartCard'
import { PageTitle, SectionHeader, SegmentedControl } from '../components/ui/controls'
import { StatusBadge } from '../components/ui/StatusBadge'
import { assessmentSeries, dailySeries, pctDelta, round1, type DayPoint } from '../lib/stats'
import { useApp } from '../store/AppStore'

function Latest({ series, base, unit, lowerBetter }: { series: DayPoint[]; base: number; unit: string; lowerBetter?: boolean }) {
  const last = series.at(-1)
  if (!last) return null
  const pct = pctDelta(last.value, base)
  const worse = lowerBetter ? pct > 3 : pct < -3
  return (
    <div className="text-right font-mono text-xs">
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

export function TrendsPage() {
  const { assessments, journal, baseline } = useApp()
  const [days, setDays] = useState(14)

  const s = useMemo(
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

  const measured = <StatusBadge tone="measured">Measured</StatusBadge>
  const self = <StatusBadge tone="self">Self-reported</StatusBadge>

  return (
    <div>
      <PageTitle
        title="Health Trends"
        subtitle="Dashed lines show your personal baseline; shaded bands show the typical range around it. Simulated demo history is merged with sessions you record."
        right={
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
        }
      />

      <SectionHeader
        title="Measured cognitive performance"
        description="Objective results from the assessments you complete."
        right={measured}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Reaction time"
          subtitle="Milliseconds, lower is faster"
          badge={measured}
          right={<Latest series={s.reaction} base={baseline.reactionMs} unit=" ms" lowerBetter />}
        >
          <BaselineChart
            data={s.reaction}
            name="Reaction time"
            unit="ms"
            baseline={baseline.reactionMs}
            band={[baseline.reactionMs * 0.9, baseline.reactionMs * 1.1]}
          />
        </ChartCard>
        <ChartCard
          title="Memory accuracy"
          subtitle="Percent of digits recalled in position"
          badge={measured}
          right={<Latest series={s.memory} base={baseline.memoryAccuracy} unit="%" />}
        >
          <BaselineChart
            data={s.memory}
            name="Memory accuracy"
            unit="%"
            color="#55C6E8"
            baseline={baseline.memoryAccuracy}
            band={[baseline.memoryAccuracy - 8, baseline.memoryAccuracy + 8]}
            domain={[40, 100]}
          />
        </ChartCard>
        <div className="xl:col-span-2">
          <ChartCard
            title="Attention performance"
            subtitle="Score 0-100 (hit rate minus false-alarm penalty)"
            badge={measured}
            right={<Latest series={s.attention} base={baseline.attentionScore} unit="" />}
          >
            <BaselineChart
              data={s.attention}
              name="Attention score"
              color="#55C6E8"
              baseline={baseline.attentionScore}
              band={[baseline.attentionScore - 8, baseline.attentionScore + 8]}
              domain={[0, 100]}
            />
          </ChartCard>
        </div>
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
            subtitle="Hours per night"
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
              extra={{ data: s.stress, name: 'Stress', color: '#F4F7FA', baseline: baseline.stress }}
            />
          </ChartCard>
        </div>
        <p className="mt-3 font-mono text-xs text-muted">
          Orange line: fatigue. White line: stress. Dashed lines: your baselines. Simulated demo data merged with your entries.
        </p>
      </div>
    </div>
  )
}
