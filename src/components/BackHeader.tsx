import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'

export function BackHeader({ to, title }: { to: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <Link
        to={to}
        aria-label="Voltar"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand"
      >
        <ArrowLeft size={20} />
      </Link>
      <h1 className="text-xl font-extrabold text-ink">{title}</h1>
    </div>
  )
}