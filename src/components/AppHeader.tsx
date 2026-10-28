import { Link } from 'react-router'
import { Bell, Leaf, Menu } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { APP_NAME, COOP_NAME } from '../lib/config'

const circleButton =
  'flex size-10 items-center justify-center rounded-full bg-brand-light text-brand'

export type HeaderVariant = 'gestao' | 'plataforma' | 'catador' | 'catador-home'

export function AppHeader({ variant }: { variant: HeaderVariant }) {
  const { user } = useAuth()
  const firstName = user?.name.split(' ')[0] ?? ''

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-brand text-white">
          <Leaf size={18} />
        </span>
        {variant === 'gestao' && (
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-ink">{APP_NAME}</p>
            <p className="text-[10px] font-medium text-ink-muted">{COOP_NAME}</p>
          </div>
        )}
        {variant === 'plataforma' && (
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-ink">{APP_NAME}</p>
            <p className="text-[10px] font-bold tracking-wide text-ink-muted">PLATAFORMA</p>
          </div>
        )}
        {variant === 'catador' && <p className="text-sm font-extrabold text-ink">{COOP_NAME}</p>}
        {variant === 'catador-home' && (
          <div className="leading-tight">
            <p className="text-[10px] font-bold tracking-wide text-brand">{APP_NAME.toUpperCase()}</p>
            <p className="text-base font-extrabold text-ink">Olá, {firstName}! 👋</p>
          </div>
        )}
      </div>

      {variant === 'gestao' && (
        <div className="flex gap-2">
          <button className={circleButton} aria-label="Notificações">
            <Bell size={18} />
          </button>
          <Link to="/gestao/mais" className={circleButton} aria-label="Menu">
            <Menu size={18} />
          </Link>
        </div>
      )}
      {(variant === 'plataforma' || variant === 'catador-home') && (
        <button className={circleButton} aria-label="Notificações">
          <Bell size={18} />
        </button>
      )}
      {variant === 'catador' && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-[11px] font-bold text-brand">
          <span className="size-1.5 rounded-full bg-brand" />
          ATIVO
        </span>
      )}
    </header>
  )
}