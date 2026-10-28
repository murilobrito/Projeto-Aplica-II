import { useState } from 'react'
import { Link } from 'react-router'
import { Download } from 'lucide-react'
import { FilterChips } from '../../components/FilterChips'
import { Card } from '../../components/Card'
import { useGestao } from '../../gestao/GestaoContext'
import { brl, int, kg } from '../../lib/format'
import { MATERIALS } from '../../lib/materials'
import { MIX, TOTAL_KG } from '../../mocks/gestao'

type Period = keyof typeof TOTAL_KG

const PERIODS: { value: Period; label: string }[] = [
  { value: '7', label: '7 dias' },
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
]

export function ComposicaoPage() {
  const { categories } = useGestao()
  const [period, setPeriod] = useState<Period>('30')
  const total = TOTAL_KG[period]

  // valor estimado = kg do material x preço base da categoria (editado em Configurações)
  const rows = MIX.map((m) => {
    const weight = (total * m.percent) / 100
    const price = categories.find((c) => c.id === m.material)?.basePrice ?? 0
    return { ...m, weight, value: weight * price }
  })

  // Rosca feita com conic-gradient (sem biblioteca): "cor inicio% fim%"
  let acc = 0
  const stops = rows
    .map((r) => {
      const from = acc
      acc += r.percent
      return `var(--color-${r.material}) ${from}% ${acc}%`
    })
    .join(', ')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink">Composição</h1>
        <Link
          to="/gestao/relatorios"
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white"
        >
          <Download size={16} />
          Exportar
        </Link>
      </div>

      <FilterChips options={PERIODS} value={period} onChange={setPeriod} />

      <Card className="flex items-center gap-4">
        <div
          className="relative size-32 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
          role="img"
          aria-label="Distribuição do mix de materiais"
        >
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-xl font-extrabold text-ink">{int(total)}</span>
            <span className="text-[10px] font-bold text-ink-muted">kg total</span>
          </div>
        </div>
        <div>
          <p className="font-extrabold text-ink">Distribuição por Mix</p>
          <p className="mt-1 text-sm text-ink-muted">Plástico lidera o volume, seguido por papelão e metais.</p>
        </div>
      </Card>

      <ul className="flex flex-col gap-2">
        {rows.map((r) => {
          const m = MATERIALS[r.material]
          return (
            <li key={r.material}>
              <Card className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`size-3 rounded-full ${m.solid}`} />
                  <div>
                    <p className="font-extrabold text-ink">{m.label}</p>
                    <p className="text-sm text-ink-muted">
                      {kg(r.weight)} ({r.percent}%)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-brand">{brl(r.value)}</p>
                  <p className="text-[11px] text-ink-subtle">Estimado</p>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}