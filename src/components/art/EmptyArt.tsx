import { lazy, memo, Suspense } from 'react'
import { Planet } from './Planet'
import { Pulse } from './Pulse'

const Astronaut = lazy(() => import('./Astronaut').then((m) => ({ default: m.Astronaut })))

export type EmptyScene = 'no-assessments' | 'all-clear' | 'no-data'

/** Small illustrated scenes for empty states (4:3). Decorative. */
export const EmptyArt = memo(function EmptyArt({
  scene,
  className = '',
}: {
  scene: EmptyScene
  className?: string
}) {
  return (
    <div className={`relative mx-auto aspect-[4/3] w-full ${className}`} aria-hidden="true">
      {scene === 'no-assessments' && (
        <>
          <Planet variant="ringed" className="absolute -top-1 right-0 w-2/5" />
          <Planet variant="moon" className="absolute bottom-0 left-0 w-1/4" />
          <Suspense fallback={null}>
            <Astronaut pose="mini" className="absolute inset-x-[22%] top-[6%] h-[92%] w-[56%]" />
          </Suspense>
        </>
      )}
      {scene === 'all-clear' && (
        <>
          <Planet variant="ice" className="absolute -right-2 top-0 w-2/5" />
          <Suspense fallback={null}>
            <Astronaut pose="mini" visorTint="#4ade80" className="absolute inset-x-[22%] top-[6%] h-[92%] w-[56%]" />
          </Suspense>
          <svg viewBox="0 0 24 24" className="absolute bottom-2 left-3 h-9 w-9" fill="none" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" strokeOpacity=".5" />
            <path d="M7 12.5l3.5 3.5L17 9" />
          </svg>
        </>
      )}
      {scene === 'no-data' && (
        <>
          <Planet variant="gas" className="absolute left-0 top-2 w-1/3" />
          <Planet variant="nebula" className="absolute right-0 bottom-0 w-2/5" />
          <Pulse className="absolute inset-x-0 top-1/2 h-1/4 w-full -translate-y-1/2" animate={false} />
        </>
      )}
    </div>
  )
})
