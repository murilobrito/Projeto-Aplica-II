import type { ComponentProps } from 'react'

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
}

const variants = {
  primary: 'bg-brand text-white hover:opacity-90',
  secondary: 'bg-brand-light text-brand hover:opacity-90',
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl px-6 py-3 text-sm font-bold transition disabled:opacity-50 ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}