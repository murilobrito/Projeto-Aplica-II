import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { MATERIALS, type MaterialId } from '../../lib/materials'

type Props = { onPick: (material: MaterialId) => void; onBack: () => void }

const ORDER: MaterialId[] = ['plastico', 'papel', 'metal', 'vidro', 'organico', 'outros']

export function CorrecaoView({ onPick, onBack }: Props) {
  return (
    <>
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Voltar"
            className="flex size-12 items-center justify-center rounded-2xl bg-white text-ink shadow-sm"
          >
            <ArrowLeft size={22} />
          </button>
          <p className="text-sm font-extrabold tracking-wide text-ink">MUDAR MATERIAL</p>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-ink">Qual é o material?</h1>
          <p className="text-sm text-ink-muted">Selecione a opção correta abaixo</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ORDER.map((id) => {
            const m = MATERIALS[id]
            return (
              <button
                key={id}
                onClick={() => onPick(id)}
                style={{ borderColor: `var(--color-${id})` }}
                className={`flex flex-col items-center gap-3 rounded-2xl border-2 px-3 py-6 shadow-md active:scale-95 ${m.soft}`}
              >
                <span className={`flex size-12 items-center justify-center rounded-xl text-white ${m.solid}`}>
                  <m.icon size={24} />
                </span>
                <span className="font-extrabold text-ink">{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="-mx-4 -mb-4 mt-4 flex items-center gap-3 bg-white px-4 py-4 text-sm text-ink-muted">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-offline-bg text-offline">
          <TriangleAlert size={18} />
        </span>
        A correção ajuda a máquina a aprender melhor!
      </div>
    </>
  )
}