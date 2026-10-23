import type { ComponentProps } from 'react'

export function Card({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 ${className}`}
      {...props}
    />
  )
}