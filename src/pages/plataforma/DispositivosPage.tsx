import { useState } from 'react'
import { Battery, Wifi } from 'lucide-react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { EstadoCarga } from '../../components/EstadoCarga'
import { FilterChips } from '../../components/FilterChips'
import { apiDispositivosPlataforma } from '../../lib/api'
import { useCarregar } from '../../lib/useCarregar'

type Status = 'todos' | 'ativos' | 'inativos'

export function PlataformaDispositivosPage() {
  const { dados, erro, recarregar } = useCarregar(apiDispositivosPlataforma)
  const [coop, setCoop] = useState('todas')
  const [status, setStatus] = useState<Status>('todos')

  const cooperativas = dados
    ? [...new Map(dados.filter((d) => d.cooperativaId !== null).map((d) => [String(d.cooperativaId), d.cooperativa ?? ''])).entries()]
    : []
  const lista = (dados ?? []).filter(
    (d) =>
      (coop === 'todas' || String(d.cooperativaId) === coop) &&
      (status === 'todos' || (status === 'ativos') === d.active),
  )
  const ativos = (dados ?? []).filter((d) => d.active).length

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Dispositivos da plataforma</h1>
        {dados && (
          <p className="mt-1 text-sm text-ink-muted">
            {dados.length} lixeiras em {cooperativas.length} cooperativas · {ativos} ativas
          </p>
        )}
      </div>

      {!dados ? (
        <EstadoCarga erro={erro} onTentar={recarregar} />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <FilterChips
              value={coop}
              onChange={setCoop}
              options={[{ value: 'todas', label: 'Todas as cooperativas' }, ...cooperativas.map(([id, nome]) => ({ value: id, label: nome }))]}
            />
            <FilterChips
              value={status}
              onChange={setStatus}
              options={[
                { value: 'todos', label: 'Todas' },
                { value: 'ativos', label: 'Ativas' },
                { value: 'inativos', label: 'Inativas' },
              ]}
            />
          </div>

          {lista.length === 0 ? (
            <Card className="text-sm text-ink-muted">Nenhum dispositivo neste filtro.</Card>
          ) : (
            <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {lista.map((d) => (
                <li key={d.id}>
                  <Card className="h-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-lg font-extrabold text-ink">{d.name}</p>
                        <p className="text-sm text-ink-muted">{d.location}</p>
                      </div>
                      <Badge variant={d.active ? 'success' : 'danger'} dot>
                        {d.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="mt-2 truncate text-xs font-bold text-brand">{d.cooperativa ?? 'Sem cooperativa'}</p>
                    <p className="mt-1 text-xs text-ink-muted">Operador: {d.catadorId ?? 'nenhum'}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-xs text-ink-muted">
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Battery size={14} />
                          {d.battery}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Wifi size={14} />
                          {d.signal}
                        </span>
                      </span>
                      <span>Atividade: {d.lastActivity}</span>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}