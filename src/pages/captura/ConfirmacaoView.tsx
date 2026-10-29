import { useEffect, useState } from 'react'
import { CheckCheck } from 'lucide-react'
import { MATERIALS, type MaterialId } from '../../lib/materials'
import { CONFIRM_MS } from '../../mocks/captura'

type Props = { material: MaterialId; title: string; onDone: () => void }

export function ConfirmacaoView({ material, title, onDone }: Props) {
  const m = MATERIALS[material]
  const [filled, setFilled] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFilled(true)) // dispara a barra de progresso
    const timer = setTimeout(onDone, CONFIRM_MS)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [onDone])

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <span className="flex size-44 items-center justify-center rounded-full bg-brand text-white shadow-xl">
          <CheckCheck size={80} strokeWidth={1.5} />
        </span>
        <div>
          <p className="text-3xl font-black text-brand">ITEM REGISTRADO!</p>
          <p className="mt-1 font-medium text-ink-muted">Bom trabalho! Continue assim.</p>
        </div>
        <span className="flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 shadow-md">
          <span className={`flex size-9 items-center justify-center rounded-full ${m.solid} ${material === 'plastico' ? 'text-ink' : 'text-white'}`}>
            <m.icon size={18} />
          </span>
          <span className="text-sm font-extrabold text-ink">+ 1 {title}</span>
        </span>
      </div>

      <div className="-mx-4 -mb-4 rounded-t-[2rem] bg-white px-8 py-6 text-center">
        <p className="text-sm font-medium text-ink-muted">Próxima captura em breve...</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: filled ? '100%' : '0%', transition: `width ${CONFIRM_MS}ms linear` }}
          />
        </div>
      </div>
    </>
  )
}