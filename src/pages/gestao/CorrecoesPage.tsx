import { useState } from 'react'
import { ArrowRight, Cpu } from 'lucide-react'
import { Card } from '../../components/Card'
import { FilterChips } from '../../components/FilterChips'
import { CORRECTIONS } from '../../mocks/gestao'

type Period = 'hoje' | 'semana' | 'mes'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
]
const MAX_DAYS: Record<Period, number> = { hoje: 0, semana: 7, mes: 30 }

export function CorrecoesPage() {
  const [period, setPeriod] = useState<Period>('hoje')
  const list = CORRECTIONS.filter((c) => c.ageDays <= MAX_DAYS[period])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-ink">Histórico de Correções</h1>
      <FilterChips options={PERIODS} value={period} onChange={setPeriod} />

      <ul className="flex flex-col gap-3">
        {list.map((c) => (
          <li key={c.id}>
            <Card>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-brand">
                  <Cpu size={14} />
                  {c.device}
                </span>
                <span className="text-ink-muted">{c.when}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-danger-soft px-3 py-1.5 text-xs font-bold text-danger">{c.from}</span>
                <ArrowRight size={14} className="text-ink-muted" />
                <span className="rounded-lg bg-brand-light px-3 py-1.5 text-xs font-bold text-brand">{c.to}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-xs text-ink-muted">
                <span>
                  Por: <b className="text-ink">{c.by}</b>
                </span>
                <span>
                  Confiança: <b className="text-brand">{c.confidence}%</b>
                </span>
              </div>
            </Card>
          </li>
        ))}
        {list.length === 0 && <p className="text-sm text-ink-muted">Nenhuma correção neste período.</p>}
      </ul>
    </div>
  )
}