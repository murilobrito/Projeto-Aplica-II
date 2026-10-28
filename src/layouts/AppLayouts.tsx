import { Outlet, useLocation } from 'react-router'
import {
  Award,
  Building2,
  ChartPie,
  Clock,
  Cpu,
  Ellipsis,
  House,
  LayoutDashboard,
  Library,
  SlidersHorizontal,
  User,
} from 'lucide-react'
import { AppHeader, type HeaderVariant } from '../components/AppHeader'
import { BottomNav, type NavItem } from '../components/BottomNav'

// Gerente e Coordenador
const gestaoNav: NavItem[] = [
  { to: '/gestao/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/gestao/composicao', label: 'Composição', icon: ChartPie },
  { to: '/gestao', label: 'Home', icon: House, end: true },
  { to: '/gestao/configuracoes', label: 'Config', icon: SlidersHorizontal },
  {
    to: '/gestao/mais',
    label: 'Mais',
    icon: Ellipsis,
    alsoActive: [
      '/gestao/equipe',
      '/gestao/relatorios',
      '/gestao/dispositivos',
      '/gestao/correcoes',
      '/gestao/usuarios',
      '/gestao/perfil',
    ],
  },
]

// Admin (equipe EcoTriall)
const plataformaNav: NavItem[] = [
  { to: '/plataforma', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/plataforma/cooperativas', label: 'Cooperativas', icon: Building2 },
  { to: '/plataforma/dispositivos', label: 'Dispositivos', icon: Cpu },
  { to: '/plataforma/catalogo', label: 'Catálogo', icon: Library },
  { to: '/plataforma/perfil', label: 'Perfil', icon: User },
]

const catadorNav: NavItem[] = [
  { to: '/catador/historico', label: 'Histórico', icon: Clock },
  { to: '/catador/desempenho', label: 'Desempenho', icon: Award },
  { to: '/catador', label: 'Home', icon: House, end: true },
  { to: '/catador/dispositivos', label: 'Dispositivos', icon: Cpu },
  { to: '/catador/perfil', label: 'Perfil', icon: User },
]

function Shell({ variant, nav }: { variant: HeaderVariant; nav: NavItem[] }) {
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

export function GestaoLayout() {
  return <Shell variant="gestao" nav={gestaoNav} />
}

export function PlataformaLayout() {
  return <Shell variant="plataforma" nav={plataformaNav} />
}

export function CatadorLayout() {
  const { pathname } = useLocation()
  // A Home do catador tem um cabeçalho próprio (saudação + sino)
  return <Shell variant={pathname === '/catador' ? 'catador-home' : 'catador'} nav={catadorNav} />
}