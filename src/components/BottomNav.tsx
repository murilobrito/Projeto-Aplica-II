import { Link, useLocation } from 'react-router'
import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean // só fica ativo na rota exata (usado no Home)
  alsoActive?: string[] // outras rotas que também deixam este item ativo (usado no "Mais")
}

function isActive(pathname: string, item: NavItem) {
  const matches = (path: string) => pathname === path || pathname.startsWith(`${path}/`)
  if (item.end) return pathname === item.to
  return matches(item.to) || (item.alsoActive ?? []).some(matches)
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-black/5 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="flex">
        {items.map((item) => {
          const active = isActive(pathname, item)
          const Icon = item.icon
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  active ? 'text-brand' : 'text-ink-muted'
                }`}
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-full ${
                    active ? 'bg-brand-light' : ''
                  }`}
                >
                  <Icon size={22} />
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}