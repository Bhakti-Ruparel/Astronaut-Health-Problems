import { useEffect, type ReactNode } from 'react'
import { EmptyArt } from '../art/EmptyArt'
import { useFirstLoad } from '../../hooks/useFirstLoad'
import { ChartSkeleton } from './Skeleton'

// Skeleton only on the very first chart mount of a session.
let chartsSeen = false

export function ChartCard({
  title,
  subtitle,
  badge,
  right,
  children,
  height = 240,
}: {
  title: string
  subtitle?: string
  badge?: ReactNode
  right?: ReactNode
  children: ReactNode
  height?: number
}) {
  const first = useFirstLoad()
  const loading = first && !chartsSeen
  useEffect(() => {
    if (!first) chartsSeen = true
  }, [first])

  return (
    <section className="panel glass-accent fade-in p-4 sm:p-5" aria-label={title}>
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {right}
          {badge}
        </div>
      </header>
      <div style={{ height }} className="w-full">
        {loading ? <ChartSkeleton height={height - 32} /> : children}
      </div>
    </section>
  )
}

export function EmptyChart({ message = 'Not enough data in this range yet.' }: { message?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-4 text-center text-sm text-muted">
      <EmptyArt scene="no-data" className="max-w-[120px]" />
      <p role="status">{message}</p>
    </div>
  )
}
