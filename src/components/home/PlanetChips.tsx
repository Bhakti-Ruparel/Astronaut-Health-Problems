import { Link } from 'react-router-dom'
import { Planet, type PlanetVariant } from '../art/Planet'

const CHIPS: { to: string; label: string; hint: string; variant: PlanetVariant }[] = [
  { to: '/assessment', label: 'Assessments', hint: 'Open cognitive assessments', variant: 'gas' },
  { to: '/journal', label: 'Journal', hint: 'Open health journal', variant: 'ice' },
  { to: '/trends', label: 'Trends', hint: 'Open health trends', variant: 'ringed' },
  { to: '/alerts', label: 'Alerts', hint: 'Open alerts and insights', variant: 'moon' },
  { to: '/profile', label: 'Profile', hint: 'Open mission profile', variant: 'nebula' },
]

export function PlanetChips() {
  return (
    <nav aria-label="Quick destinations" className="-mx-1">
      <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 md:justify-between md:overflow-visible">
        {CHIPS.map((c) => (
          <li key={c.to} className="shrink-0 snap-start">
            <Link
              to={c.to}
              aria-label={c.hint}
              className="group flex w-24 flex-col items-center gap-2 rounded-3xl p-2 text-center transition-transform hover:-translate-y-1"
            >
              <span className="glass grid h-16 w-16 place-items-center rounded-full p-1.5 transition-shadow group-hover:shadow-[var(--glow-cyan)]">
                <Planet variant={c.variant} className="h-full w-full" />
              </span>
              <span className="text-xs font-medium text-white/90">{c.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
