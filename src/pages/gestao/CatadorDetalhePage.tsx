import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { Cpu } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { can } from '../../auth/permissions'
import { Avatar } from '../../components/Avatar'
import { BackHeader } from '../../components/BackHeader'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { useGestao } from '../../gestao/GestaoContext'
import { int } from '../../lib/format'
import { MATERIALS } from '../../lib/materials'
import { CATADOR_STATS } from '../../mocks/gestao'
import { AssignDeviceSheet } from './VinculoSheets'

const WEEK = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

export function CatadorDetalhePage() {
  const { catadorId } = useParams()
  const { user } = useAuth()
  const { users, devices } = useGestao()
  const [assigning, setAssigning] = useState(false)

  const catador = users.find((u) => u.id === catadorId && u.role === 'catador')
  if (!user) return null
  if (!catador) return <Navigate to="/gestao/equipe" replace />

  // catador recém-criado ainda não tem histórico
  const stats = CATADOR_STATS[catador.id] ?? { kg: 0, items: 0, accuracy: 0, corrections: 0, weekKg: [0, 0, 0, 0, 0, 0, 0], mix: [] }
  const device = devices.find((d) => d.catadorId === catador.id)
  const maxWeek = Math.max(1, ...stats.weekKg)

  return (
    <div className="flex flex-col gap-4">
      <BackHeader to="/gestao/equipe" title="Desempenho" />

      <Card className="flex items-center gap-4">
        <Avatar name={catador.name} />
        <div className="min-w-0">
          <p className="text-lg font-extrabold text-ink">{catador.name}</p>
          <p className="truncate text-sm text-ink-muted">ID {catador.id}</p>
          <Badge variant={catador.active ? 'success' : 'offline'} dot className="mt-1">
            {catador.active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {[
          ['Volume (30 dias)', `${int(stats.kg)} kg`],
          ['Itens classificados', int(stats.items)],
          ['Precisão', `${stats.accuracy.toFixed(1).replace('.', ',')}%`],
          ['Correções', int(stats.corrections)],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-[11px] font-medium uppercase text-ink-muted">{label}</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Últimos 7 dias (kg)</p>
        <div className="mt-3 flex h-24 items-end gap-2">
          {stats.weekKg.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t-md bg-brand" style={{ height: `${(v / maxWeek) * 100}%`, minHeight: v ? 4 : 0 }} />
              <span className="text-[10px] font-bold text-ink-subtle">{WEEK[i]}</span>
            </div>
          ))}
        </div>
      </Card>

      {stats.mix.length > 0 && (
        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Mix de materiais</p>
          <ul className="mt-3 flex flex-col gap-3">
            {stats.mix.map((m) => (
              <li key={m.material}>
                <div className="flex justify-between text-sm font-bold text-ink">
                  <span>{MATERIALS[m.material].label}</span>
                  <span>{m.percent}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/5">
                  <div className={`h-full rounded-full ${MATERIALS[m.material].solid}`} style={{ width: `${m.percent}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-light text-brand">
          <Cpu size={18} />
        </span>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase text-ink-subtle">Dispositivo vinculado</p>
          <p className="font-bold text-ink">{device?.name ?? 'Nenhum'}</p>
        </div>
      </Card>

      {can(user.role, 'dispositivos:vincular') && catador.active && (
        <Button variant="secondary" fullWidth onClick={() => setAssigning(true)}>
          {device ? 'Trocar dispositivo' : 'Vincular dispositivo'}
        </Button>
      )}

      {assigning && <AssignDeviceSheet catador={catador} onClose={() => setAssigning(false)} />}
    </div>
  )
}