import { Trophy } from 'lucide-react'
import { Card } from '../../components/Card'
import { PageHeading } from '../../components/PageHeading'
import { PERFORMANCE } from '../../mocks/catador'

function ProgressRing({ value }: { value: number }) {
  const radius = 34
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative flex size-24 items-center justify-center">
      <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="8" className="stroke-brand-light" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-brand"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <span className="text-sm font-bold text-ink">{value}%</span>
    </div>
  )
}

export function DesempenhoPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading title="Meu Desempenho" subtitle="Acompanhamento de metas e acertos" />

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-sm text-ink-muted">ITENS HOJE</p>
          <p className="mt-2 text-4xl font-extrabold text-brand">{PERFORMANCE.itemsToday}</p>
          <p className="mt-2 text-xs font-medium text-brand">{PERFORMANCE.deltaVsYesterday}</p>
        </Card>

        <Card className="flex flex-col items-center">
          <p className="text-sm text-ink-muted">TAXA DE ACERTO</p>
          <ProgressRing value={PERFORMANCE.accuracy} />
        </Card>
      </div>

      <Card>
        <p className="font-extrabold text-ink">Atividade Semanal</p>
        <div className="mt-4 flex justify-between px-1">
          {PERFORMANCE.week.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-2">
              <div className="flex h-24 w-4 items-end rounded-full bg-brand-light">
                <div className="w-full rounded-full bg-brand" style={{ height: `${d.value}%` }} />
              </div>
              <span className="text-xs text-ink-muted">{d.day}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-4 rounded-2xl border border-gold/30 bg-offline-bg p-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gold text-white">
          <Trophy size={26} />
        </span>
        <div>
          <p className="font-extrabold text-offline">Super Catador</p>
          <p className="text-sm text-offline">
            Você bateu a meta de acertos por {PERFORMANCE.streakDays} dias seguidos!
          </p>
        </div>
      </div>
    </div>
  )
}