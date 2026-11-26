import { useState } from 'react'
import { Outlet } from 'react-router'
import { Building2, Cpu, LayoutDashboard, Leaf, Library, Menu, User } from 'lucide-react'
import { AppSidebar, type SidebarItem } from '../components/AppSidebar'
import { APP_NAME } from '../lib/config'

const NAV: SidebarItem[] = [
  { to: '/plataforma', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/plataforma/cooperativas', label: 'Cooperativas', icon: Building2 },
  { to: '/plataforma/dispositivos', label: 'Dispositivos', icon: Cpu },
  { to: '/plataforma/catalogo', label: 'Catálogo', icon: Library },
  { to: '/plataforma/perfil', label: 'Perfil', icon: User },
]

// Área do admin (equipe EcoTriall): barra lateral no computador, gaveta no celular
export function PlataformaLayout() {
  const [drawerAberto, setDrawerAberto] = useState(false)

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
          <p className="text-sm font-extrabold text-ink">{APP_NAME} · Plataforma</p>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}