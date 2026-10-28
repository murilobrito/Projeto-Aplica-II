import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { useGestao } from '../../gestao/GestaoContext'
import { int } from '../../lib/format'
import { CATADOR_STATS, deviceShort } from '../../mocks/gestao'

export function EquipePage() {
  const { users, devices } = useGestao()
  const catadores = users
    .filter((u) => u.role === 'catador')
    .sort((a, b) => Number(b.active) - Number(a.active) || (CATADOR_STATS[b.id]?.kg ?? 0) - (CATADOR_STATS[a.id]?.kg ?? 0))

  const ativos = catadores.filter((c) => c.active)
  const maxKg = Math.max(1, ...ativos.map((c) => CATADOR_STATS[c.id]?.kg ?? 0))
  const totalItems = ativos.reduce((sum, c) => sum + (CATADOR_STATS[c.id]?.items ?? 0), 0)
  const totalCorrections = ativos.reduce((sum, c) => sum + (CATADOR_STATS[c.id]?.corrections ?? 0), 0)
  const accuracy = totalItems ? (1 - totalCorrections / totalItems) * 100 : 0

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Desempenho da Equipe</h1>
        <p className="mt-1 text-sm text-ink-muted">Catadores nos últimos 30 dias</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[11px] font-medium uppercase text-ink-muted">Catadores ativos</p>
          <p className="mt-1 text-xl font-extrabold text-ink">{ativos.length}</p>
        </Card>
        <div className="rounded-2xl border border-brand bg-brand-light p-4">
          <p className="text-[11px] font-medium uppercase text-brand">Precisão média</p>
          <p className="mt-1 text-xl font-extrabold text-ink">{accuracy.toFixed(1).replace('.', ',')}%</p>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {catadores.map((c) => {
          const s = CATADOR_STATS[c.id]
          const device = devices.find((d) => d.catadorId === c.id)
          return (
            <li key={c.id}>
              <Link to={`/gestao/equipe/${c.id}`}>
                <Card className={c.active ? '' : 'opacity-60'}>
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} className="size-11 text-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-ink">{c.name}</p>
                      <p className="text-xs text-ink-muted">{device ? deviceShort(device) : 'Sem dispositivo'}</p>
                    </div>
                    {c.active ? (
                      <ChevronRight size={18} className="text-ink-subtle" />
                    ) : (
                      <Badge variant="offline">Inativo</Badge>
                    )}
                  </div>
                  {c.active && s && (
                    <>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/5">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${(s.kg / maxKg) * 100}%` }} />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-ink-muted">
                        <span>
                          <b className="text-ink">{int(s.kg)} kg</b> · {int(s.items)} itens
                        </span>
                        <span>
                          Precisão <b className="text-ink">{s.accuracy.toFixed(1).replace('.', ',')}%</b>
                        </span>
                      </div>
                    </>
                  )}
                </Card>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}