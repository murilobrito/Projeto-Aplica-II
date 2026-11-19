import { useEffect, useState } from 'react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { apiDashboard, type DashboardData } from '../../lib/api'
import { DAILY_KG, KPIS, MIX } from '../../mocks/gestao'
import { MATERIALS } from '../../lib/materials'

export function GestaoDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    let ativo = true
    apiDashboard().then((d) => { if (ativo) setData(d) }).catch(() => {})
    return () => {
      ativo = false
    }
  }, [])

  // Mock como fallback enquanto o backend não responde.
  const kpis = data?.kpis ?? KPIS
  const mix = data?.mix ?? MIX
  const dailyKg = data?.dailyKg ?? DAILY_KG

  const max = Math.max(...dailyKg)
  const average = dailyKg.reduce((sum, v) => sum + v, 0) / dailyKg.length

  return (
    <div className="flex flex-col gap-3">
      {kpis.map((k) => (
        <div
          key={k.id}
          className={`rounded-2xl p-4 shadow-sm ${
            k.highlight ? 'border border-brand bg-brand-light' : 'bg-white ring-1 ring-black/5'
          }`}
        >
          <p className="text-[11px] font-medium text-ink-muted">{k.label}</p>
          <div className="mt-1 flex items-end justify-between">
            <p className="text-2xl font-extrabold text-ink">{k.value}</p>
            <Badge variant="success" className="px-2 py-0.5 text-[11px]">
              {k.delta}
            </Badge>
          </div>
        </div>
      ))}

      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm font-extrabold text-ink">Coleta nos Últimos 30 Dias (kg)</p>
          <p className="text-[11px] font-bold text-brand">Méd: {average.toFixed(1)}kg</p>
        </div>
        <div className="mt-4 flex h-28 items-end gap-[3px]">
          {dailyKg.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-brand/70"
              style={{ height: `${(v / max) * 100}%` }}
              title={`${v} kg`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-ink-subtle">
          <span>Dia 1</span>
          <span>Dia 15</span>
          <span>Hoje</span>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-extrabold text-ink">Mix por Tipo de Material</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {mix.map(({ material, percent }) => (
            <li key={material} className="flex items-center gap-3 text-sm">
              <span className="w-16 font-bold text-ink">{MATERIALS[material].label}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-brand-light">
                <span
                  className={`block h-full rounded-full ${MATERIALS[material].solid}`}
                  style={{ width: `${percent}%` }}
                />
              </span>
              <span className="w-9 text-right text-xs font-bold text-ink">{percent}%</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}