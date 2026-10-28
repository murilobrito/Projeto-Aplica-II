import { Link } from 'react-router'
import { Bell, Leaf, Menu } from 'lucide-react'
import { APP_NAME, COOP_NAME } from '../lib/config'

const circleButton =
  'flex size-10 items-center justify-center rounded-full bg-brand-light text-brand'

export function AppHeader({ variant }: { variant: 'admin' | 'catador' }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-brand text-white">
          <Leaf size={18} />
        </span>
        {variant === 'admin' ? (
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-ink">{APP_NAME}</p>
            <p className="text-[10px] font-medium text-ink-muted">{COOP_NAME}</p>
          </div>
        ) : (
          <p className="text-sm font-extrabold text-ink">{COOP_NAME}</p>
        )}
      </div>

      {variant === 'admin' ? (
        <div className="flex gap-2">
          <button className={circleButton} aria-label="Notificações">
            <Bell size={18} />
          </button>
          <Link to="/admin/mais" className={circleButton} aria-label="Menu">
            <Menu size={18} />
          </Link>
        </div>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-[11px] font-bold text-brand">
          <span className="size-1.5 rounded-full bg-brand" />
          ATIVO
        </span>
      )}
    </header>
  )
}