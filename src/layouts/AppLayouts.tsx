import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Award, Bell, Building2, Clock, Cpu, House, LayoutDashboard, Library, Menu, User } from 'lucide-react'
import { AppHeader, type HeaderVariant } from '../components/AppHeader'
import { BottomNav, type NavItem } from '../components/BottomNav'
import { GestaoSidebar } from '../components/GestaoSidebar'

// Admin (equipe EcoTriall) — ainda no shell mobile
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

// Shell mobile (coluna estreita + navegação inferior), usado por catador e admin
function MobileShell({ variant, nav }: { variant: HeaderVariant; nav: NavItem[] }) {
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

// Painel web do coordenador: sidebar no desktop, drawer no mobile, conteúdo em largura cheia
export function GestaoLayout() {
  const [drawerAberto, setDrawerAberto] = useState(false)

  return (
    <div className="flex min-h-dvh bg-surface">
      <GestaoSidebar className="hidden lg:flex" />

      {drawerAberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerAberto(false)}
            aria-hidden
          />
          <GestaoSidebar className="absolute inset-y-0 left-0 shadow-xl" onNavigate={() => setDrawerAberto(false)} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white px-4 py-3">
          <button
            className="flex size-10 items-center justify-center rounded-full bg-brand-light text-brand lg:hidden"
            onClick={() => setDrawerAberto(true)}
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
          <span className="hidden lg:block" />
          <button
            className="flex size-10 items-center justify-center rounded-full bg-brand-light text-brand"
            aria-label="Notificações"
          >
            <Bell size={18} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export function PlataformaLayout() {
  return <MobileShell variant="plataforma" nav={plataformaNav} />
}

export function CatadorLayout() {
  const { pathname } = useLocation()
  // A Home do catador tem um cabeçalho próprio (saudação + sino)
  return <MobileShell variant={pathname === '/catador' ? 'catador-home' : 'catador'} nav={catadorNav} />
}
