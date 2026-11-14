import { Link } from 'react-router-dom'
import { ASTRONAUT, MISSION } from '../../data/constants'
import { useMissionClock } from '../../hooks/useMissionClock'

function OrbitMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="5" fill="#FC6D26" />
      <ellipse cx="16" cy="16" rx="14" ry="6" fill="none" stroke="#55C6E8" strokeWidth="1.5" transform="rotate(-25 16 16)" />
      <circle cx="27" cy="10" r="1.8" fill="#F4F7FA" />
    </svg>
  )
}

export function TopBar() {
  const met = useMissionClock()
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-white/10 bg-navy/95 px-4 backdrop-blur">
      <Link to="/" className="flex items-center gap-2" aria-label="AstroMind home">
        <OrbitMark />
        <span className="text-lg font-semibold tracking-tight">
          Astro<span className="text-cyan">Mind</span>
        </span>
      </Link>
      <div className="hidden h-6 w-px bg-white/15 md:block" />
      <div className="hidden min-w-0 md:block">
        <div className="label-mono leading-none">Mission</div>
        <div className="truncate text-sm font-medium">
          {MISSION.name} <span className="text-muted">({MISSION.tag})</span>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="hidden sm:block" title="Demo value, not a real mission clock">
          <div className="label-mono leading-none">MET (DEMO) D:H:M:S</div>
          <div className="font-mono text-sm text-cyan" aria-label="Demo mission elapsed time">
            {met}
          </div>
        </div>
        <div className="hidden items-center gap-2 lg:flex" title="Simulated link: no real telemetry is connected">
          <span className="pulse-dot h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
          <div>
            <div className="label-mono leading-none">Simulated link</div>
            <div className="text-xs text-ok">Nominal</div>
          </div>
        </div>
        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-full border border-white/15 py-1 pr-3 pl-1 transition-colors hover:border-cyan"
          aria-label={`Astronaut profile: ${ASTRONAUT.name}`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange font-mono text-xs font-semibold text-navy">
            {ASTRONAUT.initials}
          </span>
          <span className="hidden text-sm sm:inline">{ASTRONAUT.name}</span>
        </Link>
      </div>
    </header>
  )
}
