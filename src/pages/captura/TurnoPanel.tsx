import { MATERIALS, type MaterialId } from '../../lib/materials'
import { brl } from '../../lib/format'

export type ItemTurno = { material: MaterialId; title: string; at: number }

// Sem sensor de peso: estimamos o valor com um peso médio por item e o preço base.
const PESO_MEDIO: Record<MaterialId, number> = {
  plastico: 0.04,
  papel: 0.12,
  metal: 0.02,
  vidro: 0.35,
  organico: 0.1,
  outros: 0.05,
}
const PRECO_BASE: Record<MaterialId, number> = {
  plastico: 1.5,
  papel: 1.0,
  metal: 2.5,
  vidro: 0.5,
  organico: 0.1,
  outros: 0,
}

export function TurnoPanel({ turno, className = '' }: { turno: ItemTurno[]; className?: string }) {
  const total = turno.length
  const valor = turno.reduce((soma, i) => soma + PESO_MEDIO[i.material] * PRECO_BASE[i.material], 0)

  const contagem = new Map<MaterialId, number>()
  for (const i of turno) contagem.set(i.material, (contagem.get(i.material) ?? 0) + 1)
  const mix = [...contagem.entries()].sort((a, b) => b[1] - a[1])

  return (
    <aside className={`flex-col gap-5 rounded-[2rem] bg-white p-6 shadow-sm ${className}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Turno de hoje</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface p-4">
          <p className="text-[11px] font-bold uppercase text-ink-muted">Itens</p>
          <p className="mt-1 text-3xl font-black text-ink">{total}</p>
        </div>
        <div className="rounded-2xl border border-brand bg-brand-light p-4">
          <p className="text-[11px] font-bold uppercase text-brand">Valor estimado</p>
          <p className="mt-1 text-2xl font-black text-ink">{brl(valor)}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Mix do turno</p>
        {total === 0 ? (
          <p className="text-sm text-ink-muted">Classifique um item para começar o turno.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {mix.map(([material, n]) => (
              <li key={material} className="flex items-center gap-3 text-sm">
                <span className={`size-3 rounded-full ${MATERIALS[material].solid}`} />
                <span className="flex-1 font-bold text-ink">{MATERIALS[material].label}</span>
                <span className="text-xs font-bold text-ink-muted">{n}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Últimos itens</p>
        <ul className="flex flex-col gap-2 overflow-y-auto">
          {turno.slice(0, 8).map((item) => {
            const m = MATERIALS[item.material]
            return (
              <li key={item.at} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2">
                <span
                  className={`flex size-8 items-center justify-center rounded-lg ${m.solid} ${
                    item.material === 'plastico' ? 'text-ink' : 'text-white'
                  }`}
                >
                  <m.icon size={16} />
                </span>
                <span className="flex-1 truncate text-sm font-bold text-ink">{item.title}</span>
                <span className="text-xs text-ink-subtle">{m.label}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
