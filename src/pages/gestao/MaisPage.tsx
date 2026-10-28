import { Link } from 'react-router'
import {
  Activity,
  ChevronRight,
  FileText,
  HardDrive,
  PencilLine,
  User,
  Users,
} from 'lucide-react'
import { Card } from '../../components/Card'

const items = [
  { to: '/gestao/equipe', label: 'Equipe', hint: 'Desempenho dos catadores', icon: Activity },
  { to: '/gestao/relatorios', label: 'Relatórios', hint: 'Gerar e baixar', icon: FileText },
  { to: '/gestao/dispositivos', label: 'Dispositivos', hint: 'Lixeiras conectadas', icon: HardDrive },
  { to: '/gestao/correcoes', label: 'Correções', hint: 'Histórico de ajustes', icon: PencilLine },
  { to: '/gestao/usuarios', label: 'Usuários', hint: 'Gestão de equipe', icon: Users },
  { to: '/gestao/perfil', label: 'Perfil', hint: 'Minha conta', icon: User },
]

export function MaisPage() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Mais opções</h1>
      {items.map(({ to, label, hint, icon: Icon }) => (
        <Link key={to} to={to}>
          <Card className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-light text-brand">
              <Icon size={20} />
            </span>
            <span className="flex-1">
              <span className="block font-bold text-ink">{label}</span>
              <span className="block text-xs text-ink-muted">{hint}</span>
            </span>
            <ChevronRight className="text-ink-subtle" size={20} />
          </Card>
        </Link>
      ))}
    </div>
  )
}