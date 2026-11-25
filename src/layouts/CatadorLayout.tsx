import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Award, Camera, Clock, Cpu, Leaf, Menu, User } from 'lucide-react'
import { AppSidebar, type SidebarItem } from '../components/AppSidebar'
import { COOP_NAME } from '../lib/config'

const NAV: SidebarItem[] = [
  { to: '/catador', label: 'Estação', icon: Camera, end: true },
  { to: '/catador/historico', label: 'Histórico', icon: Clock },
  { to: '/catador/desempenho', label: 'Desempenho', icon: Award },
  { to: '/catador/dispositivos', label: 'Dispositivos', icon: Cpu },
  { to: '/catador/perfil', label: 'Perfil', icon: User },
]

// Área do catador no computador da estação: barra lateral (menu em gaveta no celular).
// A tela "Estação" ocupa a área toda; as demais ficam centralizadas numa coluna.
export function CatadorLayout() {
  const [drawerAberto, setDrawerAberto] = useState(false)
  const { pathname } = useLocation()
  const naEstacao = pathname === '/catador'

  return (
    <div className="flex min-h-dvh bg-surface">
      <AppSidebar items={NAV} className="hidden lg:flex" />

      {drawerAberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerAberto(false)} aria-hidden />
          <AppSidebar items={NAV} className="absolute inset-y-0 left-0 shadow-xl" onNavigate={() => setDrawerAberto(false)} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3 lg:hidden">
          <button
            className="flex size-10 items-center justify-center rounded-full bg-brand-light text-brand"
            onClick={() => setDrawerAberto(true)}
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
          <span className="flex size-9 items-center justify-center rounded-full bg-brand text-white">
            <Leaf size={18} />
          </span>
          <p className="text-sm font-extrabold text-ink">{COOP_NAME}</p>
        </header>

        <main className={`flex-1 p-4 lg:p-6 ${naEstacao ? '' : 'sm:p-6 lg:p-8'}`}>
          <div className={naEstacao ? 'w-full' : 'mx-auto w-full max-w-3xl'}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}