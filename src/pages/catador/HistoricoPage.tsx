import { useState } from 'react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { FilterChips } from '../../components/FilterChips'
import { MaterialIcon } from '../../components/MaterialIcon'
import { PageHeading } from '../../components/PageHeading'
import { MATERIALS } from '../../lib/materials'
import { HISTORY, type Period } from '../../mocks/catador'

const OPTIONS: { value: Period; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Esta Semana' },
  { value: 'mes', label: 'Este Mês' },
]

// "Esta semana" inclui o que é de hoje; "Este mês" inclui tudo
const INCLUDES: Record<Period, Period[]> = {
  hoje: ['hoje'],
  semana: ['hoje', 'semana'],
  mes: ['hoje', 'semana', 'mes'],
}

export function HistoricoPage() {
  const [period, setPeriod] = useState<Period>('hoje')
  const items = HISTORY.filter((c) => INCLUDES[period].includes(c.period))

  return (
    <div>
      <PageHeading title="Histórico" subtitle="Itens classificados e validados" />
      <FilterChips options={OPTIONS} value={period} onChange={setPeriod} />

      <ul className="mt-4 flex flex-col gap-3">
        {items.map((c) => (
          <li key={c.id}>
            <Card className="flex items-center gap-3">
              <MaterialIcon material={c.material} />
              <div className="flex-1">
                <p className="font-bold text-ink">{MATERIALS[c.material].label}</p>
                <p className="text-xs text-ink-muted">
                  {c.item} • {c.ago}
                </p>
              </div>
              <Badge variant={c.status === 'validado' ? 'success' : 'warning'}>
                {c.status === 'validado' ? 'Validado' : 'Corrigido'}
              </Badge>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}