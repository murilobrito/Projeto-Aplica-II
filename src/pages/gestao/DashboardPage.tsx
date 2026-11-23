import { useEffect, useState } from 'react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { useGestao } from '../../gestao/GestaoContext'
import { apiDashboard, type DashboardData } from '../../lib/api'
import { brl, kg } from '../../lib/format'
import { MATERIALS } from '../../lib/materials'
import { DAILY_KG, KPIS, MIX, TOTAL_KG } from '../../mocks/gestao'

export function GestaoDashboardPage() {
  const { categories } = useGestao()
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
  const totalKg = (data?.totalKg ?? TOTAL_KG)['30'] ?? 0

  const max = Math.max(...dailyKg, 1)
  const media = dailyKg.reduce((soma, v) => soma + v, 0) / dailyKg.length

  // Valor estimado do lote = peso por material × preço base da categoria
  const linhasValor = mix.map((m) => {
    const peso = (totalKg * m.percent) / 100
    const preco = categories.find((c) => c.id === m.material)?.basePrice ?? 0
    return { material: m.material, peso, valor: peso * preco }
  })
  const valorTotal = linhasValor.reduce((soma, l) => soma + l.valor, 0)

  // Rosca do mix com conic-gradient (sem biblioteca)
  let acc = 0
  const stops = mix
    .map((m) => {
      const ini = acc
      acc += m.percent
      return `var(--color-${m.material}) ${ini}% ${acc}%`
    })
    .join(', ')

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.id}
            className={`rounded-2xl p-4 shadow-sm ${
              k.highlight ? 'border border-brand bg-brand-light' : 'bg-white ring-1 ring-black/5'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{k.label}</p>
            <div className="mt-2 flex items-end justify-between gap-2">
              <p className="text-2xl font-extrabold text-ink">{k.value}</p>
              <Badge variant="success" className="px-2 py-0.5 text-[11px]">
                {k.delta}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de coleta + Mix */}
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-extrabold text-ink">Coleta nos últimos 30 dias</p>
            <span className="rounded-full bg-brand-light px-3 py-1 text-[11px] font-bold text-brand">
              Média {media.toFixed(1)} kg/dia
            </span>
          </div>
          <div className="relative mt-5 flex h-40 items-end gap-1 sm:gap-1.5">
            <div
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-brand/40"
              style={{ bottom: `${(media / max) * 100}%` }}
            />
            {dailyKg.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-brand/70 transition-colors hover:bg-brand"
                style={{ height: `${(v / max) * 100}%` }}
                title={`${v} kg`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-ink-subtle">
            <span>Há 30 dias</span>
            <span>Há 15 dias</span>
            <span>Hoje</span>
          </div>
        </Card>

        <Card>
          <p className="font-extrabold text-ink">Mix por tipo de material</p>
          <div className="mt-4 flex items-center justify-center">
            <div
              className="relative size-36 rounded-full"
              style={{ background: `conic-gradient(${stops})` }}
              role="img"
              aria-label="Distribuição do mix de materiais"
            >
              <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-lg font-extrabold text-ink">{Math.round(totalKg)}</span>
                <span className="text-[10px] font-bold text-ink-muted">kg no mês</span>
              </div>
            </div>
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {mix.map((m) => (
              <li key={m.material} className="flex items-center gap-2 text-sm">
                <span className={`size-3 rounded-full ${MATERIALS[m.material].solid}`} />
                <span className="flex-1 font-bold text-ink">{MATERIALS[m.material].label}</span>
                <span className="text-xs font-bold text-ink-muted">{m.percent}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Valor estimado do lote (RF0006) */}
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-extrabold text-ink">Valor estimado do lote</p>
            <p className="text-xs text-ink-muted">
              Mix dos últimos 30 dias × preço base de cada material
            </p>
          </div>
          <p className="text-3xl font-black text-brand">{brl(valorTotal)}</p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {linhasValor.map((l) => {
            const m = MATERIALS[l.material]
            return (
              <div key={l.material} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
                <span
                  className={`flex size-9 items-center justify-center rounded-lg ${m.solid} ${
                    l.material === 'plastico' ? 'text-ink' : 'text-white'
                  }`}
                >
                  <m.icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{m.label}</p>
                  <p className="text-xs text-ink-muted">{kg(l.peso)}</p>
                </div>
                <p className="text-sm font-extrabold text-brand">{brl(l.valor)}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
