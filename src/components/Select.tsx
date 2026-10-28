import type { ComponentProps } from 'react'

type SelectProps = ComponentProps<'select'> & { label: string }

export function Select({ label, id, className = '', children, ...props }: SelectProps) {
  const selectId = id ?? props.name

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-xs font-bold uppercase text-ink-muted">
        {label}
      </label>
      <select
        id={selectId}
        className={`rounded-xl border border-black/10 bg-white px-4 py-3 text-ink outline-none focus:ring-2 focus:ring-brand ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}