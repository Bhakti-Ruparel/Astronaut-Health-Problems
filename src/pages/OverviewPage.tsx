import { ArrowRight, Brain, NotebookPen } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertCard } from '../components/alerts/AlertCard'
import { EmptyArt } from '../components/art/EmptyArt'
import { Hero } from '../components/home/Hero'
import { HealthModules } from '../components/home/HealthModules'
import { PlanetChips } from '../components/home/PlanetChips'
import { BaselineChart } from '../components/ui/BaselineChart'
import { ChartCard } from '../components/ui/ChartCard'
import { SectionHeader } from '../components/ui/controls'
import { EmptyState } from '../components/ui/EmptyState'
import { ChartSkeleton, SkeletonBlock } from '../components/ui/Skeleton'
import { DemoBadge, StatusBadge } from '../components/ui/StatusBadge'
import { useFirstLoad } from '../hooks/useFirstLoad'
import { cognitiveIndex, healthStatus } from '../lib/metrics'
import { assessmentSeries, dailySeries, dateKey, formatDateTime, ofType } from '../lib/stats'
import { useApp } from '../store/AppStore'

export function OverviewPage() {
  const { assessments, journal, baseline, alerts, preferences } = useApp()
  const today = dateKey(new Date())
  const loading = useFirstLoad()

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
  const index = cognitiveIndex(baseline, { reaction: lastReaction, memory: lastMemory, attention: lastAttention })
  const status = healthStatus(alerts)

  return (
    <div className="space-y-8 md:space-y-10">
      <Hero index={index} status={status} alertCount={alerts.length} doneToday={doneToday} />

      <PlanetChips />

      <div>
        <SectionHeader title="Health modules" right={preferences.showDemoBadges ? <DemoBadge /> : undefined} />
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" role="status" aria-label="Loading health modules">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonBlock key={i} height={220} className="rounded-[1.75rem]" />
            ))}
          </div>
        ) : (
          <HealthModules
            index={index}
            baseline={baseline}
            series={d}
            lastReaction={lastReaction}
            lastMemory={lastMemory}
            lastAttention={lastAttention}
            latestJournal={latestJournal}
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <ChartSkeleton height={220} />
          ) : (
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
          )}
        </div>

        <section className="glass fade-in flex flex-col p-5 md:p-7" aria-label="Latest assessment">
          <div className="mb-2 flex items-center gap-2">
            <Brain size={18} className="text-cyan" aria-hidden="true" />
            <h2 className="text-base font-semibold">Latest assessment</h2>
          </div>
          {latestAssessment ? (
            <>
              <p className="num font-display text-5xl font-semibold">{latestAssessment.score}</p>
              <p className="mt-1 text-sm capitalize text-white/85">
                {latestAssessment.type} test ·{' '}
                {latestAssessment.type === 'reaction'
                  ? `${latestAssessment.reactionMs} ms`
                  : latestAssessment.type === 'memory'
                    ? `${latestAssessment.accuracy}% accuracy`
                    : `${latestAssessment.hits}/${latestAssessment.targets} hits`}
              </p>
              <p className="num mt-1 text-xs text-muted">
                {formatDateTime(latestAssessment.timestamp)} · {latestAssessment.source === 'seed' ? 'Simulated' : 'You'}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">No assessments yet.</p>
          )}
          <p className="mt-3 text-sm text-muted">
            {doneToday ? 'An assessment is logged for today.' : 'No assessment recorded today. It takes about 4 minutes.'}{' '}
            {journalToday ? 'Journal check-in done.' : 'No journal check-in yet today.'}
          </p>
          <div className="mt-auto flex flex-wrap gap-3 pt-4">
            <Link to="/trends" className="inline-flex items-center gap-1 text-sm text-cyan hover:underline">
              View trends <ArrowRight size={14} aria-hidden="true" />
            </Link>
            {!journalToday && (
              <Link to="/journal" className="inline-flex items-center gap-1 text-sm text-cyan hover:underline">
                <NotebookPen size={14} aria-hidden="true" /> Check-in
              </Link>
            )}
          </div>
        </section>
      </div>

      <div>
        <SectionHeader
          title="Recent alerts and recommendations"
          right={
            <Link to="/alerts" className="text-sm text-cyan hover:underline">
              All alerts
            </Link>
          }
        />
        {alerts.length === 0 ? (
          <EmptyState
            art={<EmptyArt scene="all-clear" />}
            title="All clear"
            body="No indicators currently exceed your thresholds."
          />
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
