import type { CSSProperties, ElementType, ReactNode } from 'react'

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5 md:p-7',
} as const

export function GlassCard({
  as: Tag = 'div',
  accent,
  padding = 'md',
  className = '',
  style,
  children,
  ...rest
}: {
  as?: ElementType
  /** CSS colour; tints the border and corner glow. */
  accent?: string
  padding?: keyof typeof PADDING
  className?: string
  style?: CSSProperties
  children?: ReactNode
  [key: string]: unknown
}) {
  return (
    <Tag
      className={`${accent ? 'glass glass-accent' : 'glass'} ${PADDING[padding]} ${className}`}
      style={accent ? ({ '--accent': accent, ...style } as CSSProperties) : style}
      {...rest}
    >
      {children}
    </Tag>
  )
}
