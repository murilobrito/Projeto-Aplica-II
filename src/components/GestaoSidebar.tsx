import { NavLink } from 'react-router'
import {
  Award,
  ChartPie,
  FileText,
  HardDrive,
  House,
  LayoutDashboard,
  Leaf,
  LogOut,
  PencilLine,
  SlidersHorizontal,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { ROLE_LABEL } from '../auth/roles'
import { APP_NAME, nomeCoop } from '../lib/config'
import { Avatar } from './Avatar'

type Item = { to: string; label: string; icon: LucideIcon; end?: boolean }

const NAV: Item[] = [
  { to: '/gestao', label: 'Início', icon: House, end: true },
  { to: '/gestao/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/gestao/composicao', label: 'Composição', icon: ChartPie },
  { to: '/gestao/relatorios', label: 'Relatórios', icon: FileText },
  { to: '/gestao/dispositivos', label: 'Dispositivos', icon: HardDrive },
  { to: '/gestao/correcoes', label: 'Correções', icon: PencilLine },
  { to: '/gestao/equipe', label: 'Equipe', icon: Award },
  { to: '/gestao/usuarios', label: 'Usuários', icon: Users },
  { to: '/gestao/configuracoes', label: 'Configurações', icon: SlidersHorizontal },
  { to: '/gestao/perfil', label: 'Perfil', icon: User },
]

type Props = { className?: string; onNavigate?: () => void }

export function GestaoSidebar({ className = '', onNavigate }: Props) {
  const { user, logout } = useAuth()

  return (
    <aside className={`flex w-72 shrink-0 flex-col border-r border-black/5 bg-white print:hidden ${className}`}>
      <div className="flex items-center gap-3 border-b border-black/5 px-5 py-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-white">
          <Leaf size={20} />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="font-extrabold text-ink">{APP_NAME}</p>
          <p className="truncate text-xs text-ink-muted">{nomeCoop(user)}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
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
