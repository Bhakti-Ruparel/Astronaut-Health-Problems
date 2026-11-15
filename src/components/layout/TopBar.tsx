import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MISSION } from '../../data/constants'
import { useMissionClock } from '../../hooks/useMissionClock'
import { useApp } from '../../store/AppStore'
import { Wordmark } from '../ui/Wordmark'

export function TopBar() {
  const met = useMissionClock()
  const { alerts } = useApp()
  return (
    <header className="glass-strong sticky top-3 z-30 mx-3 mt-3 flex min-h-14 items-center gap-3 rounded-full px-3 py-1.5 md:top-5 md:mx-5 md:mt-5 md:px-5">
      <Link to="/" className="rounded-full md:hidden" aria-label="AstroMind home">
        <Wordmark />
      </Link>
      <div className="hidden min-w-0 md:block">
        <div className="label-mono leading-none">Mission</div>
        <div className="truncate text-sm font-medium">
          {MISSION.name} <span className="text-muted">({MISSION.tag})</span>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div title="Demo value, not a real mission clock" className="text-right">
          <div className="label-mono leading-none">
            <span className="hidden sm:inline">MET (DEMO) D:H:M:S</span>
            <span className="sm:hidden">DEMO</span>
          </div>
          <div className="num text-sm text-cyan-bright" aria-label="Demo mission elapsed time">
            {met}
          </div>
        </div>
        <div
          className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 lg:flex"
          title="Simulated link: no real telemetry is connected"
        >
          <span className="pulse-dot h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
          <span className="text-xs">
            <span className="text-muted">Simulated link</span> <span className="text-ok">Nominal</span>
          </span>
        </div>
        <Link
          to="/alerts"
          className="btn-icon relative"
          aria-label={`Alerts: ${alerts.length} active`}
        >
          <Bell size={18} aria-hidden="true" />
          {alerts.length > 0 && (
            <span
              aria-hidden="true"
              className="num absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold text-void"
            >
              {alerts.length}
            </span>
          )}
        </Link>
        <Link
          to="/profile"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-cyan to-violet text-sm font-bold text-void"
          aria-label="Demo profile"
          title="Public demo"
        >
          D
        </Link>
      </div>
    </header>
  )
}
