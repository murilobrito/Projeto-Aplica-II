import { useEffect, useState } from 'react'
import { Check, TriangleAlert } from 'lucide-react'
import { useGestao } from '../gestao/GestaoContext'

export function GestaoToast() {
  const { aviso } = useGestao()
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    if (!aviso) return
    setVisivel(true)
    const timer = setTimeout(() => setVisivel(false), 2500)
    return () => clearTimeout(timer)
  }, [aviso])

  if (!aviso || !visivel) return null

  const erro = aviso.tipo === 'erro'
  return (
    <div role="status" className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink shadow-lg ring-1 ring-black/5">
        <span className={`flex size-6 items-center justify-center rounded-full text-white ${erro ? 'bg-danger' : 'bg-brand'}`}>
          {erro ? <TriangleAlert size={14} /> : <Check size={14} />}
        </span>
        {aviso.texto}
      </div>
    </div>
  )
}
