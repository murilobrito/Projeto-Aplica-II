import { Link } from 'react-router'
import { Info, ChevronRight } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { can } from '../../auth/permissions'
import { Card } from '../../components/Card'
import { useGestao } from '../../gestao/GestaoContext'
import { brl } from '../../lib/format'
import { MATERIALS } from '../../lib/materials'

export function ConfiguracoesPage() {
  const { user } = useAuth()
  const { categories } = useGestao()
  if (!user) return null
  const canEdit = can(user.role, 'categorias:editar')

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Categorias de Triagem</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Ajuste os valores estimados pagos por kg e as subcategorias ativas no classificador de IA dos
          coletores.
        </p>
      </div>

      {!canEdit && (
        <div className="flex items-start gap-2 rounded-xl bg-offline-bg p-3 text-sm font-medium text-offline">
          <Info size={18} className="mt-0.5 shrink-0" />
          Somente leitura. Apenas o gerente edita preços.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {categories.map((c) => {
          const m = MATERIALS[c.id]
          return (
            <Link key={c.id} to={`/gestao/configuracoes/${c.id}`}>
              <Card className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className={`flex size-10 items-center justify-center rounded-xl ${m.soft} ${m.text}`}>
                    <m.icon size={20} />
                  </span>
                  <ChevronRight size={18} className="text-ink-subtle" />
                </div>
                <div>
                  <p className="font-extrabold text-ink">{m.label}</p>
                  <p className="text-xs text-ink-muted">{c.groups.length} subcategorias</p>
                </div>
                <div className="border-t border-black/5 pt-2">
                  <p className="text-[10px] text-ink-subtle">Preço Base</p>
                  <p className="font-extrabold text-brand">{brl(c.basePrice)}/kg</p>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      <p className="text-xs text-ink-subtle">
        Novas categorias exigem retreino do modelo de IA e são criadas pela equipe EcoTriall.
      </p>
    </div>
  )
}