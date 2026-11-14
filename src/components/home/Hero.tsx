import { ArrowRight, NotebookPen } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { MISSION } from '../../data/constants'
import { useMissionClock } from '../../hooks/useMissionClock'
import { clamp } from '../../lib/stats'
import { healthSentence, STATUS_RING, STATUS_TEXT, type HealthStatus } from '../../lib/metrics'
import { Planet } from '../art/Planet'
import { Pulse } from '../art/Pulse'
import { Starfield } from '../art/Starfield'
import { ProgressRing } from '../ui/ProgressRing'
import { DemoBadge, StatusBadge } from '../ui/StatusBadge'
import { Wordmark } from '../ui/Wordmark'

const Astronaut = lazy(() => import('../art/Astronaut').then((m) => ({ default: m.Astronaut })))
const Earth = lazy(() => import('../art/Earth').then((m) => ({ default: m.Earth })))

const TONE = { nominal: 'nominal', watch: 'watch', attention: 'attention' } as const

export function Hero({
  index,
  status,
  alertCount,
  doneToday,
}: {
  index: number | null
  status: HealthStatus
  alertCount: number
  doneToday: boolean
}) {
  const clock = useMissionClock()
  const day = Number(clock.split(':')[0])

  return (
    <section
      aria-label="Mission overview"
      className="relative isolate min-h-[720px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-midnight via-[#1a1b5e] to-[#3b1f7a] shadow-[0_30px_80px_-30px_rgb(0_0_0/.8)] md:min-h-[580px]"
    >
      {/* backdrop art */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <Starfield className="absolute inset-0 h-full w-full opacity-80" />
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-violet/30 blur-3xl" />
        <Suspense fallback={null}>
          <Earth className="absolute -bottom-[34%] -right-[22%] w-[110%] max-w-none md:-bottom-[48%] md:-right-[8%] md:w-[62%]" />
        </Suspense>
        <Planet variant="ringed" animate className="absolute right-[4%] top-5 w-24 md:right-[7%] md:top-8 md:w-36" />
        <Planet variant="moon" className="absolute right-[8%] top-[40%] w-10 opacity-90 md:left-[47%] md:right-auto md:top-[18%] md:w-16" />
        <Suspense
          fallback={
            <div className="absolute bottom-0 left-1/2 h-1/2 w-1/2 -translate-x-1/2 rounded-full bg-gradient-to-t from-cyan/20 to-transparent md:left-auto md:right-[14%] md:translate-x-0" />
          }
        >
          <Astronaut className="absolute bottom-6 left-1/2 h-[330px] w-auto -translate-x-1/2 drop-shadow-[0_20px_40px_rgb(125_227_255/.25)] md:bottom-0 md:left-auto md:right-[8%] md:h-[104%] md:translate-x-0" />
        </Suspense>
        <Pulse className="absolute inset-x-0 bottom-0 h-14 w-full opacity-60" />
      </div>

      {/* scrim keeps text readable over art */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-midnight/85 via-midnight/45 to-transparent md:bg-gradient-to-r md:from-midnight/90 md:via-midnight/55 md:to-transparent"
        aria-hidden="true"
      />

      <div className="relative flex h-full max-w-xl flex-col items-start gap-5 p-6 pb-[360px] md:min-h-[580px] md:justify-center md:p-12 md:pb-44">
        <span className="glass inline-flex items-center rounded-full px-3 py-1.5">
          <Wordmark />
        </span>

        <StatusBadge tone={TONE[status]}>Mission status: {STATUS_TEXT[status]}</StatusBadge>

        <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-white md:text-7xl">
          Hello,{' '}
          <span className="bg-gradient-to-r from-cyan-bright to-violet-soft bg-clip-text text-transparent">Commander</span>.
        </h1>

        <p className="num text-sm text-white/90 md:text-base">
          Day {day} of {MISSION.name} · simulated demo mission
        </p>

        <div>
          <p className="text-sm leading-relaxed text-white/90 md:text-base">{healthSentence(index, alertCount)}</p>
          <p className="label-mono mt-2">Monitoring indicators, not medical diagnoses.</p>
        </div>

        <DemoBadge />

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <Link to="/assessment" className="btn btn-primary pr-2">
            {doneToday ? 'Run another test' : 'Start daily assessment'}
            <span className="grid h-8 w-8 place-items-center rounded-full bg-void/25">
              <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
          <Link to="/journal" className="btn btn-ghost">
            <NotebookPen size={16} aria-hidden="true" /> Open journal
          </Link>
        </div>
      </div>

      {/* cognitive index chip */}
      <div className="glass absolute bottom-9 left-12 hidden items-center gap-3 rounded-3xl p-3 pr-5 md:flex">
        <ProgressRing value={index === null ? 0 : clamp(index, 0, 100)} size={84} color={STATUS_RING[status]} label="Cognitive index">
          <span className="num font-display text-xl font-semibold">{index ?? '–'}</span>
        </ProgressRing>
        <div>
          <p className="label-mono">Cognitive index</p>
          <p className="text-xs text-muted">100 = your baseline</p>
        </div>
      </div>
    </section>
  )
}
