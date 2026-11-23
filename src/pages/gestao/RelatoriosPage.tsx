import { useEffect, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { Card } from '../../components/Card'
import { FilterChips } from '../../components/FilterChips'
import { useGestao } from '../../gestao/GestaoContext'
import { apiDashboard, type DashboardData } from '../../lib/api'
import { brl, int, kg } from '../../lib/format'
import { MATERIALS } from '../../lib/materials'
import { MIX, TOTAL_KG } from '../../mocks/gestao'

type Periodo = '7' | '30' | '90'

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: '7', label: '7 dias' },
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
]

export function RelatoriosPage() {
  const { categories, coop } = useGestao()
  const [periodo, setPeriodo] = useState<Periodo>('30')
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    let ativo = true
    apiDashboard().then((d) => ativo && setData(d)).catch(() => {})
    return () => {
      ativo = false
    }
  }, [])

  const mix = data?.mix ?? MIX
  const totalKg = (data?.totalKg ?? TOTAL_KG)[periodo]

  const linhas = mix.map((m) => {
    const peso = (totalKg * m.percent) / 100
    const preco = categories.find((c) => c.id === m.material)?.basePrice ?? 0
    return { material: m.material, percent: m.percent, peso, preco, valor: peso * preco }
  })
  const valorTotal = linhas.reduce((soma, l) => soma + l.valor, 0)

  function baixarCsv() {
    const nome = PERIODOS.find((p) => p.value === periodo)?.label ?? periodo
    const corpo = [
      ['Material', 'Peso (kg)', 'Participacao (%)', 'Preco base (R$/kg)', 'Valor estimado (R$)'],
      ...linhas.map((l) => [MATERIALS[l.material].label, l.peso.toFixed(2), String(l.percent), l.preco.toFixed(2), l.valor.toFixed(2)]),
      ['Total', totalKg.toFixed(2), '100', '', valorTotal.toFixed(2)],
    ]
    // ponto-e-vírgula e BOM para o Excel em pt-BR abrir com acento e colunas certas
    const csv = '﻿' + corpo.map((c) => c.join(';')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `composicao-${nome.replace(' ', '-')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Relatório de composição</h1>
          <p className="text-sm text-ink-muted">{coop.razao}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-ink"
          >
            <Printer size={16} />
            Imprimir / PDF
          </button>
          <button
            onClick={baixarCsv}
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white"
          >
            <Download size={16} />
            Baixar CSV
          </button>
        </div>
      </div>

      <div className="print:hidden">
        <FilterChips options={PERIODOS} value={periodo} onChange={setPeriodo} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Volume no período</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">{int(Math.round(totalKg))} kg</p>
        </Card>
        <Card>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Materiais</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">{linhas.length}</p>
        </Card>
        <div className="rounded-2xl border border-brand bg-brand-light p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand">Valor estimado</p>
          <p className="mt-1 text-2xl font-black text-ink">{brl(valorTotal)}</p>
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-[11px] uppercase text-ink-muted">
              <th className="px-4 py-3 font-bold">Material</th>
              <th className="px-4 py-3 text-right font-bold">Peso</th>
              <th className="px-4 py-3 text-right font-bold">Participação</th>
              <th className="px-4 py-3 text-right font-bold">Preço base</th>
              <th className="px-4 py-3 text-right font-bold">Valor estimado</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const m = MATERIALS[l.material]
              return (
                <tr key={l.material} className="border-b border-black/5">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-bold text-ink">
                      <span className={`size-3 rounded-full ${m.solid}`} />
                      {m.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-ink-muted">{kg(l.peso)}</td>
                  <td className="px-4 py-3 text-right text-ink-muted">{l.percent}%</td>
                  <td className="px-4 py-3 text-right text-ink-muted">{brl(l.preco)}/kg</td>
                  <td className="px-4 py-3 text-right font-bold text-brand">{brl(l.valor)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-surface font-extrabold text-ink">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right">{kg(totalKg)}</td>
              <td className="px-4 py-3 text-right">100%</td>
              <td className="px-4 py-3" />
              <td className="px-4 py-3 text-right text-brand">{brl(valorTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>

      <p className="text-xs text-ink-subtle">
        Valores estimados a partir do mix coletado e do preço base de cada material, ajustável em Configurações.
      </p>
    </div>
  )
}
