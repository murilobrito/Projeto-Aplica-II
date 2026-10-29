import { CircleCheck, Pencil } from 'lucide-react'
import { MATERIALS } from '../../lib/materials'
import type { Detection } from '../../mocks/captura'

type Props = { detection: Detection; onConfirm: () => void; onCorrect: () => void }

export function ResultadoView({ detection, onConfirm, onCorrect }: Props) {
  const m = MATERIALS[detection.material]

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="text-sm font-extrabold tracking-wide text-ink-muted">MATERIAL DETECTADO</p>

        <span
          className={`flex size-44 items-center justify-center rounded-full shadow-xl ${m.solid} ${
            detection.material === 'plastico' ? 'text-ink' : 'text-white'
          }`}
        >
          <m.icon size={80} strokeWidth={1.5} />
        </span>

        <div>
          <p className="text-4xl font-black uppercase text-ink">{m.label}</p>
          <p className="mt-1 font-medium text-ink-muted">{detection.description}</p>
        </div>

        <p className="flex items-center gap-2 text-sm font-bold text-ink-muted">
          Confiança:
          <span className="flex gap-1.5" aria-label={`${detection.confidence} de 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`size-3 rounded-full ${n <= detection.confidence ? 'bg-brand' : 'bg-black/10'}`}
              />
            ))}
          </span>
        </p>
      </div>

      <div className="-mx-4 -mb-4 flex flex-col gap-3 rounded-t-[2rem] bg-white p-5 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <button
          onClick={onConfirm}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-extrabold text-white active:opacity-90"
        >
          <CircleCheck size={22} />
          SIM, CONFIRMAR
        </button>
        <button
          onClick={onCorrect}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-offline bg-offline-bg py-4 text-base font-extrabold text-offline active:opacity-90"
        >
          <Pencil size={20} />
          NÃO, CORRIGIR
        </button>
      </div>
    </>
  )
}