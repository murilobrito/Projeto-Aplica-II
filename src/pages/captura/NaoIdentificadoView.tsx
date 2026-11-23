import { useEffect } from 'react'
import { Camera } from 'lucide-react'

type Props = { onRetry: () => void }

// Mostrada quando a IA não reconhece nada na imagem (ex.: apontar para a parede).
// Volta sozinha para a espera; o catador também pode tocar em "Tentar de novo".
export function NaoIdentificadoView({ onRetry }: Props) {
  useEffect(() => {
    const timer = setTimeout(onRetry, 2500)
    return () => clearTimeout(timer)
  }, [onRetry])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="flex size-32 items-center justify-center rounded-full bg-black/5 text-ink-muted">
        <Camera size={64} strokeWidth={1.5} />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-ink">Não reconheci o item</p>
        <p className="mt-1 font-medium text-ink-muted">Aproxime o item da câmera e tente de novo.</p>
      </div>
      <button
        onClick={onRetry}
        className="rounded-2xl bg-brand px-6 py-3 text-base font-extrabold text-white active:opacity-90"
      >
        Tentar de novo
      </button>
    </div>
  )
}
