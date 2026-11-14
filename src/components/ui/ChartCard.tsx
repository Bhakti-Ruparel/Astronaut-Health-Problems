import type { ReactNode } from 'react'

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
  return (
    <section className="panel fade-in p-4" aria-label={title}>
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {right}
          {badge}
        </div>
      </header>
      <div style={{ height }} className="w-full">
        {children}
      </div>
    </section>
  )
}

export function EmptyChart({ message = 'Not enough data in this range yet.' }: { message?: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/15 text-sm text-muted">
      {message}
    </div>
  )
}
