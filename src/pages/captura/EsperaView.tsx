import { useEffect, useRef } from 'react'
import { CircleAlert, Trash2 } from 'lucide-react'
import { CAPTURE_WAIT_MS } from '../../mocks/captura'

type Props = {
  stream: MediaStream | null
  cameraFailed: boolean
  onDetect: (foto: Blob | null) => void
}

export function EsperaView({ stream, cameraFailed, onDetect }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

  // Tira um frame do vídeo para enviar ao backend. Sem câmera, devolve null
  // (o fluxo segue em modo demonstração).
  function capturar(): Promise<Blob | null> {
    const video = videoRef.current
    if (!video || !video.videoWidth) return Promise.resolve(null)
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85))
  }

  function disparar() {
    void capturar().then(onDetect)
  }

  // A "IA" reconhece sozinha depois de um tempo
  useEffect(() => {
    const timer = setTimeout(disparar, CAPTURE_WAIT_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDetect])

  const ready = stream !== null

  return (
    <>
      <div className="relative flex-1 overflow-hidden rounded-[2rem] bg-gradient-to-b from-stone-500 to-stone-700">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 size-full object-cover"
        />

        <span className="absolute left-1/2 top-[18%] flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-[11px] font-bold tracking-wide text-white">
          <span className={`size-2 rounded-full ${ready ? 'bg-green-400' : 'bg-offline'}`} />
          {ready ? 'CÂMERA PRONTA' : cameraFailed ? 'MODO DEMONSTRAÇÃO' : 'ABRINDO CÂMERA...'}
        </span>

        <div className="absolute inset-x-0 top-1/2 flex -translate-y-[58%] flex-col items-center gap-5">
          {/* Tocar na moldura reconhece o objeto na hora */}
          <button
            onClick={disparar}
            aria-label="Reconhecer objeto agora"
            className="flex size-56 items-center justify-center rounded-[2rem] border-4 border-brand"
          >
            <span className="flex size-20 items-center justify-center rounded-full bg-white/95 text-brand shadow-lg">
              <Trash2 size={36} />
            </span>
          </button>
          <div className="text-center text-white drop-shadow">
            <p className="text-xl font-extrabold">Coloque o item</p>
            <p className="text-sm">dentro da abertura da lixeira</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-ink-muted">
        <CircleAlert size={22} className="shrink-0 text-brand" />
        O aparelho reconhece o material sozinho!
      </div>
    </>
  )
}