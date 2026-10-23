import type { ComponentProps } from 'react'

type InputProps = ComponentProps<'input'> & {
  label: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-ink-muted">
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded-xl border border-black/10 bg-white px-4 py-3 text-ink outline-none focus:ring-2 focus:ring-brand ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-offline">{error}</p>}
    </div>
  )
}