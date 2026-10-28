import type { ReactNode } from 'react'

type BadgeProps = {
  variant: 'online' | 'offline' | 'success' | 'warning'
  dot?: boolean // bolinha antes do texto
  className?: string
  children: ReactNode
}

const styles = {
  online: 'bg-brand-light text-brand',
  success: 'bg-brand-light text-brand',
  offline: 'bg-offline-bg text-offline',
  warning: 'bg-offline-bg text-offline',
}

export function Badge({ variant, dot = false, className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${styles[variant]} ${className}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}