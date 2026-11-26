import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { ROLE_LABEL } from '../../auth/roles'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { EstadoCarga } from '../../components/EstadoCarga'
import { apiResumoPlataforma } from '../../lib/api'
import { formatToday } from '../../lib/date'
import { int } from '../../lib/format'
import { useCarregar } from '../../lib/useCarregar'

function Indicador({ rotulo, valor, destaque = false }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className={destaque ? 'rounded-2xl border border-brand bg-brand-light p-4' : 'rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5'}>
      <p className={`text-[11px] font-medium uppercase ${destaque ? 'text-brand' : 'text-ink-muted'}`}>{rotulo}</p>
      <p className="mt-1 text-xl font-extrabold text-ink">{valor}</p>
    </div>
  )
}

export function PlataformaPainelPage() {
  const { user } = useAuth()
  const { dados, erro, recarregar } = useCarregar(apiResumoPlataforma)
  if (!user) return null

  const maior = dados ? Math.max(1, ...dados.porCooperativa.map((c) => c.itens30d)) : 1
  const taxa = dados && dados.itens30d ? (dados.correcoes30d / dados.itens30d) * 100 : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Olá, {user.name.split(' ')[0]}!</h1>
          <p className="mt-1 text-sm font-bold text-brand">{ROLE_LABEL[user.role]} · Plataforma EcoTriall</p>
        </div>
        <p className="text-sm text-ink-muted">{formatToday(new Date())}</p>
      </div>

      {!dados ? (
        <EstadoCarga erro={erro} onTentar={recarregar} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Indicador destaque rotulo="Cooperativas ativas" valor={`${dados.cooperativasAtivas} de ${dados.cooperativas}`} />
            <Indicador rotulo="Usuários ativos" valor={int(dados.usuarios)} />
            <Indicador rotulo="Lixeiras online" valor={`${dados.dispositivosAtivos} / ${dados.dispositivos}`} />
            <Indicador rotulo="Itens hoje" valor={int(dados.itensHoje)} />
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Indicador rotulo="Itens em 30 dias" valor={int(dados.itens30d)} />
            <Indicador rotulo="Correções em 30 dias" valor={int(dados.correcoes30d)} />
            <Indicador rotulo="Taxa de correção" valor={`${taxa.toFixed(1).replace('.', ',')}%`} />
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-ink">Cooperativas</h2>
              <Link to="/plataforma/cooperativas" className="text-sm font-bold text-brand">
                Ver todas
              </Link>
            </div>
            <Card className="!p-0">
              <ul className="divide-y divide-black/5">
                {dados.porCooperativa.map((c) => (
                  <li key={c.id}>
                    <Link to={`/plataforma/cooperativas/${c.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-black/[0.02]">
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-bold text-ink">{c.razao}</span>
                          {!c.ativa && <Badge variant="danger">Desativada</Badge>}
                        </span>
                        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-black/5">
                          <span className="block h-full rounded-full bg-brand" style={{ width: `${(c.itens30d / maior) * 100}%` }} />
                        </span>
                      </span>
                      <span className="w-28 shrink-0 text-right">
                        <span className="block text-sm font-extrabold text-ink">{int(c.itens30d)}</span>
                        <span className="block text-[11px] text-ink-muted">itens em 30 dias</span>
                      </span>
                      <ChevronRight size={18} className="shrink-0 text-ink-subtle" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}