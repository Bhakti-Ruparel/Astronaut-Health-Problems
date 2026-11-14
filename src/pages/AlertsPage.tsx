import { TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AlertCard } from '../components/alerts/AlertCard'
import { EmptyArt, Pulse } from '../components/art'
import { PageTitle, SectionHeader } from '../components/ui/controls'
import { EmptyState } from '../components/ui/EmptyState'
import { useApp } from '../store/AppStore'

export function AlertsPage() {
  const { alerts, dismissedAlerts, dismissAlert, restoreAlert, preferences } = useApp()

  return (
    <div>
      <div className="relative">
        <Pulse className="pointer-events-none absolute -top-2 right-0 h-14 w-1/2 opacity-40 md:w-2/3" />
        <PageTitle
          title="Alerts"
          subtitle="Possible changes that deserve attention, calculated from your measured results and journal entries."
        />
      </div>

      <div
        role="note"
        className="glass relative mb-8 flex items-start gap-3 overflow-hidden p-4 pl-5 text-sm shadow-[inset_4px_0_0_0_#fc6d26,0_0_40px_-12px_rgb(252_109_38/0.55)]"
      >
        <TriangleAlert size={20} className="mt-0.5 shrink-0 text-orange" aria-hidden="true" />
        <p>
          <strong className="text-[#ffb38f]">Monitoring indicators, not medical diagnoses.</strong> These
          messages describe changes relative to your own baseline. They cannot identify any medical
          condition. If you are concerned about how you feel, contact your crew medical officer or
          flight surgeon. Based on simulated demo data in this prototype.
        </p>
      </div>

      <SectionHeader title={`Active indicators (${alerts.length})`} />
      {alerts.length === 0 ? (
        <EmptyState
          art={<EmptyArt scene="all-clear" />}
          title="All clear, Commander"
          body="No indicators currently exceed your thresholds."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {alerts.map((a) => (
            <AlertCard key={a.id} alert={a} onDismiss={() => dismissAlert(a.id)} />
          ))}
        </div>
      )}

      {dismissedAlerts.length > 0 && (
        <div className="mt-10">
          <SectionHeader title="Acknowledged" description="Hidden until new data changes the picture, or restore them here." />
          <div className="grid gap-4 lg:grid-cols-2">
            {dismissedAlerts.map((a) => (
              <div key={a.id} className="opacity-85">
                <AlertCard alert={a} compact onRestore={() => restoreAlert(a.id)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <details className="glass group mt-10 p-5">
        <summary className="cursor-pointer text-sm font-semibold text-white">How these are calculated</summary>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/85 marker:text-cyan">
          <li>
            <strong>Reaction time:</strong> at least all but one of your last 5 sessions (minimum 4 sessions) are{' '}
            <span className="num">{preferences.reactionThresholdPct}%</span> or more above baseline. {preferences.alertsEnabled['reaction-slow'] ? '' : '(Disabled)'}
          </li>
          <li>
            <strong>Memory accuracy:</strong> over the last 4 sessions accuracy trends downward (at least 2 declining steps) with a
            total drop of <span className="num">{preferences.memoryDropPoints}</span> points or more. {preferences.alertsEnabled['memory-decline'] ? '' : '(Disabled)'}
          </li>
          <li>
            <strong>Sleep duration:</strong> over the last 7 journal days the trend slopes down, and the last 3 days average at least{' '}
            <span className="num">{preferences.sleepDropHours}</span> h below the earlier 4 days or your baseline. {preferences.alertsEnabled['sleep-decrease'] ? '' : '(Disabled)'}
          </li>
          <li>
            <strong>Fatigue:</strong> over the last 7 journal days the trend rises, and the last 3 days average at least{' '}
            <span className="num">{preferences.fatigueRise}</span> points above baseline. {preferences.alertsEnabled['fatigue-rising'] ? '' : '(Disabled)'}
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted">
          Adjust thresholds in <Link to="/profile" className="text-cyan-bright underline">Profile</Link>.
        </p>
      </details>
    </div>
  )
}
