import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function GameFrame({
  title,
  progress,
  onCancel,
  children,
  status,
  current,
  total,
}: {
  title: string
  progress?: string
  onCancel: () => void
  children: ReactNode
  status?: string
  /** Optional 1-based position (trial / round / symbol) for the progress bar. */
  current?: number
  total?: number
}) {
  const hasBar = typeof current === 'number' && typeof total === 'number' && total > 0
  const done = hasBar ? Math.min(total, Math.max(0, current)) : 0
  const segmented = hasBar && total <= 12

  return (
    <section className="glass-strong fade-in p-4 md:p-6" aria-label={title}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-white md:text-xl">{title}</h2>
          {progress && <p className="num mt-0.5 text-xs text-cyan-bright">{progress}</p>}
        </div>
        <button type="button" onClick={onCancel} className="btn btn-ghost shrink-0" aria-label="Cancel test">
          <X size={16} aria-hidden="true" /> Abort mission
        </button>
      </header>

      {hasBar && (
        <div
          role="progressbar"
          aria-label={`${title} progress`}
          aria-valuemin={0}
          aria-valuenow={done}
          aria-valuemax={total}
          className="mb-5"
        >
          {segmented ? (
            <div className="flex gap-1.5">
              {Array.from({ length: total }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-[background-color,box-shadow] duration-300 ${
                    i < done ? 'bg-linear-to-r from-cyan to-violet shadow-[0_0_10px_rgb(85_198_232/0.6)]' : 'bg-white/12'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="h-1.5 overflow-hidden rounded-full bg-white/12">
              <div
                className="h-full rounded-full bg-linear-to-r from-cyan to-violet shadow-[0_0_10px_rgb(85_198_232/0.6)] transition-[width] duration-300"
                style={{ width: `${(done / total) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {children}
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  )
}
