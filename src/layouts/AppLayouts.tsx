import { Outlet } from 'react-router'
import {
  Award,
  ChartPie,
  Clock,
  Cpu,
  Ellipsis,
  House,
  LayoutDashboard,
  SlidersHorizontal,
  User,
} from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { BottomNav, type NavItem } from '../components/BottomNav'

const adminNav: NavItem[] = [
  { to: '/admin/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/admin/composicao', label: 'Composição', icon: ChartPie },
  { to: '/admin', label: 'Home', icon: House, end: true },
  { to: '/admin/configuracoes', label: 'Config', icon: SlidersHorizontal },
  {
    to: '/admin/mais',
    label: 'Mais',
    icon: Ellipsis,
    alsoActive: [
      '/admin/relatorios',
      '/admin/dispositivos',
      '/admin/correcoes',
      '/admin/usuarios',
      '/admin/perfil',
    ],
  },
]

const catadorNav: NavItem[] = [
  { to: '/catador/historico', label: 'Histórico', icon: Clock },
  { to: '/catador/desempenho', label: 'Desempenho', icon: Award },
  { to: '/catador', label: 'Home', icon: House, end: true },
  { to: '/catador/dispositivos', label: 'Dispositivos', icon: Cpu },
  { to: '/catador/perfil', label: 'Perfil', icon: User },
]

function Shell({ variant, nav }: { variant: 'admin' | 'catador'; nav: NavItem[] }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface shadow-sm md:border-x md:border-black/5">
      <AppHeader variant={variant} />
      <main className="flex-1 p-4 pb-28">
        <Outlet />
      </main>
      <BottomNav items={nav} />
    </div>
  )
}

export function AdminLayout() {
  return <Shell variant="admin" nav={adminNav} />
}

export function CatadorLayout() {
  return <Shell variant="catador" nav={catadorNav} />
}