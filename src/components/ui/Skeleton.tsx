export function SkeletonBlock({ className = '', height }: { className?: string; height?: number | string }) {
  return <div className={`skeleton ${className}`} style={height ? { height } : undefined} aria-hidden="true" />
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div role="status" aria-label="Loading chart" className="space-y-3">
      <SkeletonBlock className="h-4 w-1/3" />
      <SkeletonBlock height={height} className="w-full" />
      <span className="sr-only">Loading chart</span>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-4">
      <SkeletonBlock className="h-8 w-1/2" />
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonBlock height={160} className="rounded-[1.75rem]" />
        <SkeletonBlock height={160} className="rounded-[1.75rem]" />
      </div>
      <SkeletonBlock height={220} className="w-full rounded-[1.75rem]" />
      <span className="sr-only">Loading</span>
    </div>
  )
}
