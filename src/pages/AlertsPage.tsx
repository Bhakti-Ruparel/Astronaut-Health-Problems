import { ShieldCheck, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AlertCard } from '../components/alerts/AlertCard'
import { PageTitle, SectionHeader } from '../components/ui/controls'
import { useApp } from '../store/AppStore'

export function AlertsPage() {
  const { alerts, dismissedAlerts, dismissAlert, restoreAlert, preferences } = useApp()

  return (
    <div>
      <PageTitle
        title="Alerts & Insights"
        subtitle="Possible changes that deserve attention, calculated from your measured results and journal entries."
      />

      <div
        role="note"
        className="mb-6 flex items-start gap-3 rounded-xl border border-orange/50 bg-orange/10 p-4 text-sm"
      >
        <TriangleAlert size={20} className="mt-0.5 shrink-0 text-orange" aria-hidden="true" />
        <p>
          <strong className="text-orange">Monitoring indicators, not medical diagnoses.</strong> These
          messages describe changes relative to your own baseline. They cannot identify any medical
          condition. If you are concerned about how you feel, contact your crew medical officer or
          flight surgeon. Based on simulated demo data in this prototype.
        </p>
      </div>

      <SectionHeader title={`Active indicators (${alerts.length})`} />
      {alerts.length === 0 ? (
        <div className="panel flex items-center gap-3 p-6 text-sm">
          <ShieldCheck className="text-ok" aria-hidden="true" />
          No indicators currently exceed your thresholds.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {alerts.map((a) => (
            <AlertCard key={a.id} alert={a} onDismiss={() => dismissAlert(a.id)} />
          ))}
        </div>
      )}

      {dismissedAlerts.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Acknowledged" description="Hidden until new data changes the picture, or restore them here." />
          <div className="grid gap-4 lg:grid-cols-2">
            {dismissedAlerts.map((a) => (
              <div key={a.id} className="opacity-80">
                <AlertCard alert={a} compact onRestore={() => restoreAlert(a.id)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <details className="panel mt-8 p-4">
        <summary className="cursor-pointer text-sm font-semibold">How these are calculated</summary>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/85">
          <li>
            <strong>Reaction time:</strong> at least all but one of your last 5 sessions (minimum 4 sessions) are{' '}
            {preferences.reactionThresholdPct}% or more above baseline. {preferences.alertsEnabled['reaction-slow'] ? '' : '(Disabled)'}
          </li>
          <li>
            <strong>Memory accuracy:</strong> over the last 4 sessions accuracy trends downward (at least 2 declining steps) with a
            total drop of {preferences.memoryDropPoints} points or more. {preferences.alertsEnabled['memory-decline'] ? '' : '(Disabled)'}
          </li>
          <li>
            <strong>Sleep duration:</strong> over the last 7 journal days the trend slopes down, and the last 3 days average at least{' '}
            {preferences.sleepDropHours} h below the earlier 4 days or your baseline. {preferences.alertsEnabled['sleep-decrease'] ? '' : '(Disabled)'}
          </li>
          <li>
            <strong>Fatigue:</strong> over the last 7 journal days the trend rises, and the last 3 days average at least{' '}
            {preferences.fatigueRise} points above baseline. {preferences.alertsEnabled['fatigue-rising'] ? '' : '(Disabled)'}
          </li>
        </ul>
        <p className="mt-3 text-sm text-muted">
          Adjust thresholds in <Link to="/profile" className="text-cyan underline">Mission Profile</Link>.
        </p>
      </details>
    </div>
  )
}
