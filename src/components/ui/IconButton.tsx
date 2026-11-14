import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & {
  'aria-label': string
  children: ReactNode
}

/** 44px circular glass button. aria-label is required. */
export function IconButton({ className = '', children, type = 'button', ...rest }: Props) {
  return (
    <button type={type} className={`btn-icon ${className}`} {...rest}>
      {children}
    </button>
  )
}
