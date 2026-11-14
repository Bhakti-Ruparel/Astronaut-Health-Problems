import type { ReactNode } from 'react'

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
        checked ? 'border-cyan bg-cyan/30 shadow-[0_0_14px_rgb(85_198_232/0.5)]' : 'border-white/30 bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4.5 w-4.5 rounded-full transition-transform ${
          checked ? 'translate-x-5 bg-cyan-bright' : 'bg-muted'
        }`}
        style={{ height: 18, width: 18 }}
      />
    </button>
  )
}

export function ScaleSelector({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(n)}
          className={`num h-11 min-w-11 rounded-full border text-sm font-medium transition-[background-color,border-color,box-shadow] ${
            value === n
              ? 'border-cyan bg-linear-to-br from-cyan to-violet text-void shadow-[0_0_16px_rgb(85_198_232/0.5)]'
              : 'border-white/20 text-white hover:border-cyan/60'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

export function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-white/15 bg-white/5 p-0.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-9 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            value === o.value ? 'bg-linear-to-br from-cyan to-violet text-void shadow-[0_0_14px_rgb(85_198_232/0.45)]' : 'text-muted hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function SectionHeader({
  title,
  description,
  right,
}: {
  title: string
  description?: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {right}
    </div>
  )
}

export function PageTitle({ title, subtitle, right }: { title: string; subtitle?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}
