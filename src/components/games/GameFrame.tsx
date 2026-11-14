import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function GameFrame({
  title,
  progress,
  onCancel,
  children,
  status,
}: {
  title: string
  progress?: string
  onCancel: () => void
  children: ReactNode
  status?: string
}) {
  return (
    <section className="panel telemetry-grid fade-in p-4 md:p-6" aria-label={title}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {progress && <p className="font-mono text-xs text-cyan">{progress}</p>}
        </div>
        <button type="button" onClick={onCancel} className="btn btn-ghost" aria-label="Cancel test">
          <X size={16} aria-hidden="true" /> Cancel
        </button>
      </header>
      {children}
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  )
}
