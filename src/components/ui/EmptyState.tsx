import type { ReactNode } from 'react'

export function EmptyState({
  art,
  title,
  body,
  action,
  className = '',
}: {
  art?: ReactNode
  title: string
  body?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`glass flex flex-col items-center gap-3 p-8 text-center ${className}`}>
      {art && (
        <div aria-hidden="true" className="mb-1 w-40 max-w-full">
          {art}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {body && <p className="max-w-md text-sm text-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
