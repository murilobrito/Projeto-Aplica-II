import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  ChartColumn,
  ChartPie,
  FileText,
  HardDrive,
  PencilLine,
  SlidersVertical,
  User,
  Users,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { ROLE_LABEL } from '../../auth/roles'
import { Card } from '../../components/Card'
import { useGestao } from '../../gestao/GestaoContext'
import { apiDashboard } from '../../lib/api'
import { formatToday } from '../../lib/date'
import { ITEMS_TODAY } from '../../mocks/gestao'

const SHORTCUTS = [
  { to: '/gestao/dashboard', label: 'Dashboard', hint: 'Métricas e indicadores', icon: ChartColumn },
  { to: '/gestao/composicao', label: 'Composição', hint: 'Mix de materiais', icon: ChartPie },
  { to: '/gestao/relatorios', label: 'Relatórios', hint: 'Gerar e baixar', icon: FileText },
  { to: '/gestao/configuracoes', label: 'Configurações', hint: 'Categorias e preços', icon: SlidersVertical },
  { to: '/gestao/dispositivos', label: 'Dispositivos', hint: 'Lixeiras conectadas', icon: HardDrive },
  { to: '/gestao/correcoes', label: 'Correções', hint: 'Histórico de ajustes', icon: PencilLine },
  { to: '/gestao/usuarios', label: 'Usuários', hint: 'Gestão de equipe', icon: Users },
  { to: '/gestao/perfil', label: 'Perfil', hint: 'Minha conta', icon: User },
]

export function GestaoHomePage() {
  const { user } = useAuth()
  const { devices } = useGestao()
  const [itens, setItens] = useState<number | null>(null)

  useEffect(() => {
    let ativo = true
    apiDashboard().then((d) => { if (ativo) setItens(d.itemsToday) }).catch(() => {})
    return () => {
      ativo = false
    }
  }, [])

  if (!user) return null

  const active = devices.filter((d) => d.active).length

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Olá, {user.name.split(' ')[0]}!</h1>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="font-bold text-brand">{ROLE_LABEL[user.role]}</span>
          <span className="text-ink-muted">{formatToday(new Date())}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[11px] font-medium uppercase text-ink-muted">Itens hoje</p>
          <p className="mt-1 text-xl font-extrabold text-ink">{itens ?? ITEMS_TODAY} un</p>
        </Card>
        <div className="rounded-2xl border border-brand bg-brand-light p-4">
          <p className="text-[11px] font-medium uppercase text-brand">Dispositivos online</p>
          <p className="mt-1 text-xl font-extrabold text-ink">
            {active} / {devices.length} ativos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SHORTCUTS.map(({ to, label, hint, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="flex h-full flex-col gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-light text-brand">
                <Icon size={20} />
              </span>
              <span>
                <span className="block font-extrabold text-ink">{label}</span>
                <span className="block text-xs text-ink-muted">{hint}</span>
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}