import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import {
  BatteryLow,
  ChevronRight,
  FileText,
  HardDrive,
  PencilLine,
  UserPlus,
  UserX,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { can } from '../../auth/permissions'
import { ROLE_LABEL } from '../../auth/roles'
import { Card } from '../../components/Card'
import { useGestao } from '../../gestao/GestaoContext'
import { apiCorrecoes, apiDashboard } from '../../lib/api'
import { formatToday } from '../../lib/date'
import { CORRECTIONS, ITEMS_TODAY, deviceShort, type Correction } from '../../mocks/gestao'

type Atencao = { id: string; texto: string; detalhe: string; to: string; icon: ReactNode }

export function GestaoHomePage() {
  const { user } = useAuth()
  const { devices, users } = useGestao()
  const [itens, setItens] = useState<number | null>(null)
  const [correcoes, setCorrecoes] = useState<Correction[]>(CORRECTIONS)

  useEffect(() => {
    let ativo = true
    apiDashboard().then((d) => { if (ativo) setItens(d.itemsToday) }).catch(() => {})
    apiCorrecoes().then((c) => { if (ativo && c.length) setCorrecoes(c) }).catch(() => {})
    return () => {
      ativo = false
    }
  }, [])

  if (!user) return null

  const online = devices.filter((d) => d.active).length
  const catadoresAtivos = users.filter((u) => u.role === 'catador' && u.active).length
  const correcoesHoje = correcoes.filter((c) => c.ageDays === 0).length

  // O que precisa de uma ação da gestão
  const atencao: Atencao[] = []
  for (const d of devices) {
    if (!d.active) {
      atencao.push({
        id: `off-${d.id}`,
        texto: `${deviceShort(d)} está offline`,
        detalhe: `Última atividade: ${d.lastActivity}`,
        to: '/gestao/dispositivos',
        icon: <HardDrive size={18} />,
      })
    }
    if (d.active && d.battery <= 20) {
      atencao.push({
        id: `bat-${d.id}`,
        texto: `${deviceShort(d)} com bateria baixa`,
        detalhe: `${d.battery}% restante`,
        to: '/gestao/dispositivos',
        icon: <BatteryLow size={18} />,
      })
    }
    if (d.active && !d.catadorId) {
      atencao.push({
        id: `vinc-${d.id}`,
        texto: `${deviceShort(d)} sem catador vinculado`,
        detalhe: 'Vincule alguém para registrar coletas',
        to: '/gestao/dispositivos',
        icon: <UserX size={18} />,
      })
    }
  }

  const acoes = [
    can(user.role, 'usuarios:criar-catador') && {
      to: '/gestao/usuarios/novo',
      label: 'Novo usuário',
      icon: UserPlus,
    },
    can(user.role, 'dispositivos:vincular') && {
      to: '/gestao/dispositivos',
      label: 'Vincular lixeira',
      icon: HardDrive,
    },
    { to: '/gestao/relatorios', label: 'Gerar relatório', icon: FileText },
    { to: '/gestao/correcoes', label: 'Ver correções', icon: PencilLine },
  ].filter((a): a is { to: string; label: string; icon: typeof FileText } => Boolean(a))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Olá, {user.name.split(' ')[0]}!</h1>
          <p className="mt-1 text-sm font-bold text-brand">{ROLE_LABEL[user.role]}</p>
        </div>
        <p className="text-sm text-ink-muted">{formatToday(new Date())}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <p className="text-[11px] font-medium uppercase text-ink-muted">Itens hoje</p>
          <p className="mt-1 text-xl font-extrabold text-ink">{itens ?? ITEMS_TODAY} un</p>
        </Card>
        <div className="rounded-2xl border border-brand bg-brand-light p-4">
          <p className="text-[11px] font-medium uppercase text-brand">Lixeiras online</p>
          <p className="mt-1 text-xl font-extrabold text-ink">
            {online} / {devices.length}
          </p>
        </div>
        <Card>
          <p className="text-[11px] font-medium uppercase text-ink-muted">Catadores ativos</p>
          <p className="mt-1 text-xl font-extrabold text-ink">{catadoresAtivos}</p>
        </Card>
        <Card>
          <p className="text-[11px] font-medium uppercase text-ink-muted">Correções hoje</p>
          <p className="mt-1 text-xl font-extrabold text-ink">{correcoesHoje}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="flex flex-col gap-3 lg:col-span-2">
          <h2 className="font-extrabold text-ink">Precisa de atenção</h2>
          {atencao.length === 0 ? (
            <Card className="text-sm text-ink-muted">Tudo certo por aqui: nenhuma pendência agora.</Card>
          ) : (
            <ul className="flex flex-col gap-2">
              {atencao.map((a) => (
                <li key={a.id}>
                  <Link to={a.to}>
                    <Card className="flex items-center gap-3 !p-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-offline-bg text-offline">
                        {a.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-ink">{a.texto}</span>
                        <span className="block text-xs text-ink-muted">{a.detalhe}</span>
                      </span>
                      <ChevronRight size={18} className="text-ink-subtle" />
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex items-center justify-between">
            <h2 className="font-extrabold text-ink">Últimas correções</h2>
            <Link to="/gestao/correcoes" className="text-sm font-bold text-brand">
              Ver todas
            </Link>
          </div>
          <Card className="!p-0">
            <ul className="divide-y divide-black/5">
              {correcoes.slice(0, 4).map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink">
                      {c.from} → {c.to}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      {[c.by, c.device].filter((v) => v && v !== '—').join(' · ') || 'Sem detalhes'}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-ink-subtle">{c.when}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-extrabold text-ink">Ações rápidas</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {acoes.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Card className="flex items-center gap-3 !p-3 hover:bg-brand-light">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-bold text-ink">{label}</span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}