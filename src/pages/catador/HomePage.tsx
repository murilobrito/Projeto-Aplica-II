import { Link } from 'react-router'
import { ChevronRight, CircleCheck, Clock, Flame, Medal, Recycle } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { MaterialIcon } from '../../components/MaterialIcon'
import { COOP_NAME } from '../../lib/config'
import { HISTORY, HOME } from '../../mocks/catador'

function greeting(date: Date) {
  const hour = date.getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatToday(date: Date) {
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  const dayMonth = date
    .toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
    .replace(' de ', ' ')
    .replace('.', '')
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${dayMonth}`
}

export function HomePage() {
  const { user } = useAuth()
  const now = new Date()
  const firstName = user?.name.split(' ')[0] ?? ''

  return (
    <div className="flex flex-col gap-4">
      {/* Cartão de boas-vindas */}
      <section className="rounded-3xl bg-gradient-to-br from-brand to-[#1B5E20] p-5 text-white shadow-md">
        <p className="text-xs font-medium uppercase tracking-wide text-white/80">
          Cooperativa {COOP_NAME.replace('COOP ', '')}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold">
          {greeting(now)}, {firstName}!
        </h1>
        <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-sm">
          <span>Hoje • {formatToday(now)}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-3 py-1 text-xs font-bold">
            <Flame size={14} className="text-orange-300" />
            {HOME.streakDays} dias
          </span>
        </div>
      </section>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-light text-brand">
              <Recycle size={16} />
            </span>
            Triagem Hoje
          </div>
          <p className="mt-3 text-2xl font-extrabold text-ink">{HOME.itemsToday} itens</p>
          <p className="mt-1 text-xs font-medium text-brand">{HOME.deltaVsYesterday}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <span className="flex size-8 items-center justify-center rounded-full bg-offline-bg text-offline">
              <Medal size={16} />
            </span>
            Precisão
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-2xl font-extrabold text-ink">
            {HOME.accuracy}%
            <CircleCheck size={18} className="text-brand" />
          </p>
          <p className="mt-1 text-xs text-ink-muted">Excelente ritmo!</p>
        </Card>
      </div>

      {/* Dispositivo vinculado */}
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            Dispositivo vinculado
          </p>
          <Badge variant={HOME.device.online ? 'online' : 'offline'} dot>
            {HOME.device.online ? 'Online' : 'Offline'}
          </Badge>
        </div>
        <p className="mt-3 text-lg font-extrabold text-ink">{HOME.device.name}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
          <Clock size={14} />
          {HOME.device.activeSince}
        </p>
        <Link
          to="/catador/dispositivos"
          className="mt-4 flex items-center justify-center gap-1 rounded-xl border border-black/10 bg-surface py-3 text-sm font-bold text-brand"
        >
          Ver Meus Dispositivos
          <ChevronRight size={16} />
        </Link>
      </Card>

      {/* Últimas classificações */}
      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
          Últimas classificações
        </p>
        <ul className="mt-2 divide-y divide-black/5">
          {HISTORY.slice(0, 3).map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <MaterialIcon material={c.material} className="size-11" />
              <div className="flex-1">
                <p className="font-bold text-ink">{c.item}</p>
                <p className="text-xs text-ink-muted">{c.ago}</p>
              </div>
              <Badge variant={c.status === 'validado' ? 'success' : 'warning'}>
                {c.status === 'validado' ? 'Validado' : 'Corrigido'}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}