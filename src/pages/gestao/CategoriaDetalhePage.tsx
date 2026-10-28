import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { ChevronDown, Info } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { can } from '../../auth/permissions'
import { BackHeader } from '../../components/BackHeader'
import { Card } from '../../components/Card'
import { Toggle } from '../../components/Toggle'
import { useGestao } from '../../gestao/GestaoContext'
import { brl } from '../../lib/format'
import { MATERIALS } from '../../lib/materials'
import type { Item } from '../../mocks/categorias'

const CONFIDENCE_OPTIONS = [75, 80, 85, 90, 95]

function ItemRow({ categoryId, item, canEdit }: { categoryId: string; item: Item; canEdit: boolean }) {
  const { updateItem } = useGestao()

  return (
    <div className="flex items-center justify-between gap-3 border-t border-black/5 px-4 py-3 first:border-t-0">
      <div className="min-w-0">
        <p className="font-bold text-ink">{item.label}</p>
        {item.hard && <p className="text-[11px] font-medium text-offline">⚠ Difícil de distinguir</p>}
        {canEdit ? (
          <label className="mt-1 flex items-center gap-1 text-xs font-bold text-brand">
            R$
            <input
              type="number"
              step="0.05"
              min="0"
              defaultValue={item.price}
              aria-label={`Preço por kg de ${item.label}`}
              onBlur={(e) => {
                const value = Number(e.target.value)
                if (!Number.isNaN(value) && value >= 0) updateItem(categoryId, item.id, { price: value })
              }}
              className="w-16 rounded-lg border border-black/10 bg-white px-2 py-1 text-ink"
            />
            /kg
          </label>
        ) : (
          <p className="text-xs font-bold text-brand">{brl(item.price)}/kg</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {canEdit ? (
          <select
            aria-label={`Confiança mínima de ${item.label}`}
            value={item.minConfidence}
            onChange={(e) => updateItem(categoryId, item.id, { minConfidence: Number(e.target.value) })}
            className="rounded-lg bg-brand-light px-2 py-1 text-[11px] font-bold text-brand"
          >
            {CONFIDENCE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                Conf.: {c}%
              </option>
            ))}
          </select>
        ) : (
          <span className="rounded-lg bg-brand-light px-2 py-1 text-[11px] font-bold text-brand">
            Conf.: {item.minConfidence}%
          </span>
        )}
        <Toggle
          label={`Ativar ${item.label}`}
          checked={item.active}
          disabled={!canEdit}
          onChange={(active) => updateItem(categoryId, item.id, { active })}
        />
      </div>
    </div>
  )
}

export function CategoriaDetalhePage() {
  const { categoriaId } = useParams()
  const { user } = useAuth()
  const { categories, setBasePrice } = useGestao()
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const category = categories.find((c) => c.id === categoriaId)
  if (!user) return null
  if (!category) return <Navigate to="/gestao/configuracoes" replace />

  const canEdit = can(user.role, 'categorias:editar')
  const m = MATERIALS[category.id]

  return (
    <div className="flex flex-col gap-4">
      <BackHeader to="/gestao/configuracoes" title={`Categoria: ${m.label}`} />

      <Card>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase text-ink-muted">Visão geral</p>
          {category.tag && (
            <span className="rounded-full bg-offline-bg px-2 py-0.5 text-[10px] font-bold text-offline">
              {category.tag}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          {canEdit
            ? 'Edite a precificação por quilo, configure as margens de confiança da IA e ative/desative os subtipos mapeados.'
            : 'Consulte preços, margens de confiança e subtipos ativos. Apenas o gerente pode alterar.'}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
          <span className="text-sm font-bold text-ink">Preço base</span>
          {canEdit ? (
            <label className="flex items-center gap-1 text-sm font-bold text-brand">
              R$
              <input
                type="number"
                step="0.05"
                min="0"
                defaultValue={category.basePrice}
                aria-label="Preço base por kg"
                onBlur={(e) => {
                  const value = Number(e.target.value)
                  if (!Number.isNaN(value) && value >= 0) setBasePrice(category.id, value)
                }}
                className="w-20 rounded-lg border border-black/10 bg-white px-2 py-1 text-ink"
              />
              /kg
            </label>
          ) : (
            <span className="font-extrabold text-brand">{brl(category.basePrice)}/kg</span>
          )}
        </div>
      </Card>

      {!canEdit && (
        <div className="flex items-start gap-2 rounded-xl bg-offline-bg p-3 text-sm font-medium text-offline">
          <Info size={18} className="mt-0.5 shrink-0" />
          Somente leitura. Apenas o gerente edita preços.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {category.groups.map((g, index) => {
          // Grupo com uma só variação (ex.: PP, Papelão) vira uma linha simples, sem sanfona
          if (g.items.length === 1) {
            return (
              <Card key={g.id} className="overflow-hidden p-0">
                <ItemRow categoryId={category.id} item={g.items[0]} canEdit={canEdit} />
              </Card>
            )
          }
          const isOpen = open[g.id] ?? index === 0
          return (
            <Card key={g.id} className="overflow-hidden p-0">
              <button
                onClick={() => setOpen((prev) => ({ ...prev, [g.id]: !isOpen }))}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between bg-brand-light px-4 py-3 text-left font-extrabold text-brand"
              >
                {g.label}
                <ChevronDown size={18} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && g.items.map((item) => (
                <ItemRow key={item.id} categoryId={category.id} item={item} canEdit={canEdit} />
              ))}
            </Card>
          )
        })}
      </div>

      {canEdit && (
        <p className="text-xs text-ink-subtle">
          As alterações de preço são salvas ao sair do campo. Novos subtipos exigem retreino da IA: solicite à
          equipe EcoTriall.
        </p>
      )}
    </div>
  )
}