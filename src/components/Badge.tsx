import type { ReactNode } from 'react'

type BadgeProps = {
  variant: 'online' | 'offline'
  children: ReactNode
}

const styles = {
  online: 'bg-brand-light text-brand',
  offline: 'bg-offline-bg text-offline',
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  )
}