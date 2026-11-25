import { NavLink } from 'react-router'
import { Leaf, LogOut, type LucideIcon } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { ROLE_LABEL } from '../auth/roles'
import { APP_NAME, COOP_NAME } from '../lib/config'
import { Avatar } from './Avatar'

export type SidebarItem = { to: string; label: string; icon: LucideIcon; end?: boolean }

type Props = { items: SidebarItem[]; className?: string; onNavigate?: () => void }

// Barra lateral genérica (mesmo visual da GestaoSidebar), usada pela área do catador
export function AppSidebar({ items, className = '', onNavigate }: Props) {
  const { user, logout } = useAuth()

  return (
    <aside className={`flex w-72 shrink-0 flex-col border-r border-black/5 bg-white print:hidden ${className}`}>
      <div className="flex items-center gap-3 border-b border-black/5 px-5 py-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-white">
          <Leaf size={20} />
        </span>
        <div className="leading-tight">
          <p className="font-extrabold text-ink">{APP_NAME}</p>
          <p className="text-xs text-ink-muted">{COOP_NAME}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                    isActive ? 'bg-brand-light text-brand' : 'text-ink-muted hover:bg-black/5 hover:text-ink'
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-black/5 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
          <Avatar name={user?.name ?? ''} className="size-9 text-xs" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-bold text-ink">{user?.name}</p>
            <p className="truncate text-xs text-ink-muted">{user ? ROLE_LABEL[user.role] : ''}</p>
          </div>
          <button onClick={logout} aria-label="Sair" className="text-ink-muted transition hover:text-danger">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}