import { ArrowRight, Brain, Moon, NotebookPen, Smile, Timer, Zap, Gauge } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertCard } from '../components/alerts/AlertCard'
import { BaselineChart } from '../components/ui/BaselineChart'
import { ChartCard } from '../components/ui/ChartCard'
import { PageTitle, SectionHeader } from '../components/ui/controls'
import { MetricCard, type MetricDelta } from '../components/ui/MetricCard'
import { ProgressRing } from '../components/ui/ProgressRing'
import { DemoBadge, StatusBadge } from '../components/ui/StatusBadge'
import { ASTRONAUT, MOOD_SCALE } from '../data/constants'
import { assessmentSeries, clamp, dailySeries, dateKey, formatDateTime, mean, ofType, pctDelta, round1 } from '../lib/stats'
import { useApp } from '../store/AppStore'

function greeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function delta(value: number, base: number, unit: string, lowerBetter: boolean, absolute = false): MetricDelta {
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

export function OverviewPage() {
  const { assessments, journal, baseline, alerts, preferences } = useApp()
  const today = dateKey(new Date())

  const d = useMemo(() => {
    const reaction = assessmentSeries(assessments, 'reaction', (a) => a.reactionMs, 14)
    const memory = assessmentSeries(assessments, 'memory', (a) => a.accuracy, 14)
    const attention = assessmentSeries(assessments, 'attention', (a) => a.score, 14)
    return {
      reaction,
      memory,
      attention,
      sleep: dailySeries(journal, (j) => j.sleepHours, 14),
      fatigue: dailySeries(journal, (j) => j.fatigue, 14),
      stress: dailySeries(journal, (j) => j.stress, 14),
    }
  }, [assessments, journal])

  const latestJournal = [...journal].sort((a, b) => a.date.localeCompare(b.date)).at(-1)
  const latestAssessment = [...assessments].sort((a, b) => a.timestamp.localeCompare(b.timestamp)).at(-1)
  const doneToday = assessments.some((a) => dateKey(a.timestamp) === today)
  const journalToday = journal.some((j) => j.date === today)

  const lastReaction = ofType(assessments, 'reaction').at(-1)?.reactionMs
  const lastMemory = ofType(assessments, 'memory').at(-1)?.accuracy
  const lastAttention = ofType(assessments, 'attention').at(-1)?.score

  // Cognitive index: average of latest results relative to personal baseline (100 = at baseline).
  const ratios: number[] = []
  if (lastReaction) ratios.push((baseline.reactionMs / lastReaction) * 100)
  if (lastMemory !== undefined) ratios.push((lastMemory / baseline.memoryAccuracy) * 100)
  if (lastAttention !== undefined) ratios.push((lastAttention / baseline.attentionScore) * 100)
  const index = ratios.length ? Math.round(mean(ratios)) : null

  const top = alerts[0]?.severity
  const status = top === 'high' ? 'attention' : top ? 'watch' : 'nominal'
  const statusText = { nominal: 'Nominal', watch: 'Watch', attention: 'Needs attention' }[status]
  const ringColor = { nominal: '#4ade80', watch: '#FC6D26', attention: '#fca5a5' }[status]
  const mood = MOOD_SCALE.find((m) => m.value === latestJournal?.mood)

  return (
    <div>
      <PageTitle
        title={`${greeting()}, ${ASTRONAUT.firstName}`}
        subtitle={`${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · Mission overview`}
        right={preferences.showDemoBadges ? <DemoBadge /> : undefined}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel telemetry-grid fade-in flex items-center gap-5 p-5 lg:col-span-2" aria-label="Health overview">
          <ProgressRing value={index === null ? 0 : clamp(index, 0, 100)} size={132} color={ringColor} label="Cognitive index">
            <span className="font-mono text-3xl">{index ?? '–'}</span>
            <span className="label-mono">index</span>
          </ProgressRing>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">Astronaut health overview</h2>
              <StatusBadge tone={status === 'attention' ? 'attention' : status === 'watch' ? 'watch' : 'nominal'}>{statusText}</StatusBadge>
            </div>
            <p className="text-sm text-white/85">
              {index === null
                ? 'Complete a cognitive assessment to compare with your baseline.'
                : `Your latest cognitive results are at ${index}% of your personal baseline (100 = at baseline).`}{' '}
              {alerts.length > 0
                ? `${alerts.length} monitoring indicator${alerts.length > 1 ? 's' : ''} deserve${alerts.length > 1 ? '' : 's'} attention.`
                : 'No monitoring indicators currently exceed your thresholds.'}
            </p>
            <p className="mt-2 font-mono text-[11px] text-muted">Monitoring indicators, not medical diagnoses.</p>
          </div>
        </section>

        <section className="panel fade-in flex flex-col justify-between p-5" aria-label="Daily assessment">
          <div>
            <h2 className="text-lg font-semibold">Daily assessment</h2>
            <p className="mt-1 text-sm text-muted">
              {doneToday ? 'You have completed an assessment today. Run more any time.' : 'No assessment recorded today. It takes about 4 minutes.'}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/assessment" className="btn btn-primary">
              {doneToday ? 'Run another test' : 'Start daily assessment'} <ArrowRight size={16} aria-hidden="true" />
            </Link>
            {!journalToday && (
              <Link to="/journal" className="btn btn-ghost">
                <NotebookPen size={16} aria-hidden="true" /> Check-in
              </Link>
            )}
          </div>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard
          label="Reaction time"
          icon={Timer}
          value={lastReaction ? Math.round(lastReaction) : '–'}
          unit="ms"
          delta={lastReaction ? delta(lastReaction, baseline.reactionMs, ' ms', true) : undefined}
          spark={d.reaction.map((p) => p.value)}
          sparkColor="#55C6E8"
          tag="Measured"
        />
        <MetricCard
          label="Sleep"
          icon={Moon}
          value={latestJournal ? latestJournal.sleepHours : '–'}
          unit="h"
          delta={latestJournal ? delta(latestJournal.sleepHours, baseline.sleepHours, ' h', false, true) : undefined}
          spark={d.sleep.map((p) => p.value)}
          sparkColor="#FC6D26"
          tag="Self-reported"
        />
        <MetricCard
          label="Fatigue"
          icon={Zap}
          value={latestJournal ? latestJournal.fatigue : '–'}
          unit="/10"
          delta={latestJournal ? delta(latestJournal.fatigue, baseline.fatigue, '', true, true) : undefined}
          spark={d.fatigue.map((p) => p.value)}
          sparkColor="#FC6D26"
          tag="Self-reported"
        />
        <MetricCard
          label="Stress"
          icon={Gauge}
          value={latestJournal ? latestJournal.stress : '–'}
          unit="/10"
          delta={latestJournal ? delta(latestJournal.stress, baseline.stress, '', true, true) : undefined}
          spark={d.stress.map((p) => p.value)}
          sparkColor="#FC6D26"
          tag="Self-reported"
        />
        <div className="col-span-2 lg:col-span-1">
          <MetricCard
            label="Mood"
            icon={Smile}
            value={mood?.label ?? '–'}
            footer={latestJournal ? `Latest check-in: ${latestJournal.date}` : 'No check-in yet'}
            tag="Self-reported"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="Reaction time, last 14 days"
            subtitle="Measured. Dashed line is your personal baseline."
            badge={<StatusBadge tone="measured">Measured</StatusBadge>}
            height={220}
          >
            <BaselineChart
              data={d.reaction}
              name="Reaction time"
              unit="ms"
              baseline={baseline.reactionMs}
              band={[baseline.reactionMs * 0.9, baseline.reactionMs * 1.1]}
            />
          </ChartCard>
        </div>

        <section className="panel fade-in p-5" aria-label="Latest assessment">
          <div className="mb-2 flex items-center gap-2">
            <Brain size={18} className="text-cyan" aria-hidden="true" />
            <h2 className="text-base font-semibold">Latest assessment</h2>
          </div>
          {latestAssessment ? (
            <>
              <p className="font-mono text-4xl">{latestAssessment.score}</p>
              <p className="mt-1 text-sm capitalize text-white/85">
                {latestAssessment.type} test ·{' '}
                {latestAssessment.type === 'reaction'
                  ? `${latestAssessment.reactionMs} ms`
                  : latestAssessment.type === 'memory'
                    ? `${latestAssessment.accuracy}% accuracy`
                    : `${latestAssessment.hits}/${latestAssessment.targets} hits`}
              </p>
              <p className="mt-1 font-mono text-xs text-muted">
                {formatDateTime(latestAssessment.timestamp)} · {latestAssessment.source === 'seed' ? 'Simulated' : 'You'}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">No assessments yet.</p>
          )}
          <Link to="/trends" className="mt-4 inline-flex items-center gap-1 text-sm text-cyan hover:underline">
            View trends <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </section>
      </div>

      <div className="mt-8">
        <SectionHeader
          title="Recent alerts and recommendations"
          right={
            <Link to="/alerts" className="text-sm text-cyan hover:underline">
              All alerts
            </Link>
          }
        />
        {alerts.length === 0 ? (
          <div className="panel p-5 text-sm text-muted">No indicators currently exceed your thresholds.</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {alerts.slice(0, 3).map((a) => (
              <AlertCard key={a.id} alert={a} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
