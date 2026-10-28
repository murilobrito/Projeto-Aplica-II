import { useState } from 'react'
import { Plus, Battery, Wifi, UserPlus } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { can } from '../../auth/permissions'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { useGestao } from '../../gestao/GestaoContext'
import type { Device } from '../../mocks/gestao'
import { AssignCatadorSheet } from './VinculoSheets'

export function GestaoDispositivosPage() {
  const { user } = useAuth()
  const { devices, users } = useGestao()
  const [assigning, setAssigning] = useState<Device | null>(null)
  if (!user) return null

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-ink">Dispositivos Coletando</h1>

      {/* Só o gerente adiciona dispositivos */}
      {can(user.role, 'dispositivos:gerenciar') && (
        <Button fullWidth className="flex items-center justify-center gap-2">
          <Plus size={18} />
          Novo Dispositivo
        </Button>
      )}

      <ul className="flex flex-col gap-3">
        {devices.map((d) => {
          const operator = users.find((u) => u.id === d.catadorId)
          return (
            <li key={d.id}>
              <Card>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-extrabold text-ink">{d.name}</p>
                    <p className="text-sm text-ink-muted">{d.location}</p>
                  </div>
                  <Badge variant={d.active ? 'success' : 'danger'} dot>
                    {d.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center gap-3 border-t border-black/5 pt-3">
                  {operator ? (
                    <Avatar name={operator.name} className="size-8 text-xs" />
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded-full bg-black/5 text-ink-subtle">
                      <UserPlus size={14} />
                    </span>
                  )}
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase text-ink-subtle">Operador vinculado</p>
                    <p className="text-sm font-bold text-ink">{operator?.name ?? 'Nenhum'}</p>
                  </div>
                  {/* Gerente e coordenador podem vincular catadores */}
                  {can(user.role, 'dispositivos:vincular') && (
                    <button
                      onClick={() => setAssigning(d)}
                      className="rounded-full bg-brand-light px-3 py-1.5 text-xs font-bold text-brand"
                    >
                      {operator ? 'Trocar' : 'Vincular'}
                    </button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
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
          )
        })}
      </ul>

      {assigning && <AssignCatadorSheet device={assigning} onClose={() => setAssigning(null)} />}
    </div>
  )
}