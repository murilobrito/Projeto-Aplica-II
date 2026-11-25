import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Check, Leaf, LogOut } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { COOP_NAME } from '../../lib/config'
import { MATERIALS, type MaterialId } from '../../lib/materials'
import { useCamera } from '../../lib/useCamera'
import { apiClassificar, apiCorrecao } from '../../lib/api'
import { CAPTURE_WAIT_MS, CONFIRM_MS, fakeClassify, type Detection } from '../../mocks/captura'
import { TurnoPanel, type ItemTurno } from './TurnoPanel'

const FOTO_VAZIA = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' })
const ORDEM: MaterialId[] = ['plastico', 'papel', 'metal', 'vidro', 'organico', 'outros']

// Guarda o turno ao trocar de tela (Histórico, Perfil...) sem perder a contagem
const turnoGuardado: { dono: string; itens: ItemTurno[] } = { dono: '', itens: [] }

type Step = 'espera' | 'resultado' | 'naoid' | 'correcao' | 'confirmacao'

export function CapturaPage({ embedded = false }: { embedded?: boolean }) {
  const { user } = useAuth()
  const { stream, failed, cameras, deviceId, setDeviceId } = useCamera()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [step, setStep] = useState<Step>('espera')
  const [detection, setDetection] = useState<Detection | null>(null)
  const donoTurno = user?.loginId ?? 'demo'
  const [turno, setTurno] = useState<ItemTurno[]>(() => (turnoGuardado.dono === donoTurno ? turnoGuardado.itens : []))
  const lastMaterial = useRef<MaterialId | undefined>(undefined)
  const detectando = useRef(false)

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

  const capturar = useCallback((): Promise<Blob | null> => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return Promise.resolve(null)
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  }, [])

  const detect = useCallback(async () => {
    if (detectando.current) return
    detectando.current = true
    try {
      const foto = await capturar()
      let result: Detection
      try {
        result = await apiClassificar(foto ?? FOTO_VAZIA)
      } catch {
        result = fakeClassify(lastMaterial.current)
      }
      if (result.detectado === false) {
        setStep('naoid')
      } else {
        lastMaterial.current = result.material
        setDetection(result)
        setStep('resultado')
      }
    } finally {
      detectando.current = false
    }
  }, [capturar])

  useEffect(() => {
    if (step !== 'espera') return
    const timer = setTimeout(detect, CAPTURE_WAIT_MS)
    return () => clearTimeout(timer)
  }, [step, detect])

  useEffect(() => {
    if (step !== 'confirmacao') return
    const timer = setTimeout(() => setStep('espera'), CONFIRM_MS)
    return () => clearTimeout(timer)
  }, [step])

  function registrar(material: MaterialId, title: string) {
      setTurno((prev) => {
      const novo = [{ material, title, at: Date.now() }, ...prev]
      turnoGuardado.dono = donoTurno
      turnoGuardado.itens = novo
      return novo
    })
    setStep('confirmacao')
  }

  function confirm() {
    if (detection) registrar(detection.material, detection.title)
  }

  function correct(material: MaterialId) {
    if (detection) {
      apiCorrecao({
        detectado: detection.material,
        corrigido: material,
        title: detection.title,
        confidence: detection.confidence,
      }).catch(() => {})
    }
    registrar(material, MATERIALS[material].label)
  }

  const status = stream ? 'CÂMERA PRONTA' : failed ? 'MODO DEMONSTRAÇÃO' : 'ABRINDO CÂMERA...'

  return (
        <div
      className={
        embedded
          ? 'flex flex-col gap-4 lg:h-[calc(100dvh-3rem)] lg:flex-row lg:gap-6'
          : 'bg-surface lg:flex lg:min-h-dvh lg:gap-6 lg:p-6'
      }
    >
      <div
        className={
          embedded
            ? 'flex min-h-[28rem] flex-1 flex-col gap-4'
            : 'mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 p-4 lg:mx-0 lg:min-h-0 lg:max-w-none lg:flex-1 lg:p-0'
        }
      >
        <header className={`flex items-center justify-between ${embedded ? 'hidden' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-brand text-white">
              <Leaf size={18} />
            </span>
            <span className="font-extrabold text-ink">{COOP_NAME}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-[11px] font-bold text-brand">
              <span className="size-1.5 rounded-full bg-brand" />
              ATIVO
            </span>
            <Link
              to="/login"
              className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-ink shadow-sm"
            >
              <LogOut size={12} />
              Sair
            </Link>
          </div>
        </header>

        <div className="relative flex-1 overflow-hidden rounded-[2rem] bg-stone-800">
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 size-full object-cover" />

          <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white">
            <span className={`size-2 rounded-full ${stream ? 'bg-green-400' : 'bg-offline'}`} />
            {status}
          </span>

          {cameras.length > 1 && (
            <select
              value={deviceId ?? ''}
              onChange={(e) => setDeviceId(e.target.value || undefined)}
              aria-label="Escolher câmera"
              className="absolute right-4 top-4 max-w-[45%] truncate rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white"
            >
              <option value="">Câmera automática</option>
              {cameras.map((c, i) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label || `Câmera ${i + 1}`}
                </option>
              ))}
            </select>
          )}

          {step === 'espera' && (
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/70 to-transparent p-6 pt-16 text-center text-white">
              <p className="text-lg font-extrabold">Aproxime o item da câmera</p>
              <button onClick={detect} className="rounded-full bg-brand px-6 py-3 text-sm font-extrabold text-white active:opacity-90">
                Classificar agora
              </button>
            </div>
          )}

          {step === 'resultado' && detection && (
            <ResultadoOverlay detection={detection} onConfirm={confirm} onCorrect={() => setStep('correcao')} />
          )}

          {step === 'naoid' && (
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/80 to-transparent p-6 pt-16 text-center text-white">
              <p className="text-lg font-extrabold">Não reconheci o item</p>
              <p className="text-sm text-white/80">Aproxime o item e tente de novo.</p>
              <button onClick={() => setStep('espera')} className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-ink active:opacity-90">
                Tentar de novo
              </button>
            </div>
          )}

          {step === 'correcao' && <CorrecaoOverlay onPick={correct} onBack={() => setStep('resultado')} />}

          {step === 'confirmacao' && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-brand/95 to-transparent p-6 pt-16 text-white">
              <span className="flex size-10 items-center justify-center rounded-full bg-white text-brand">
                <Check size={22} />
              </span>
              <p className="text-lg font-black">Item registrado!</p>
            </div>
          )}
        </div>
      </div>

            <TurnoPanel turno={turno} className={embedded ? 'flex lg:w-96 lg:shrink-0' : 'hidden lg:flex lg:w-96 lg:shrink-0'} />
    </div>
  )
}

function ResultadoOverlay({
  detection,
  onConfirm,
  onCorrect,
}: {
  detection: Detection
  onConfirm: () => void
  onCorrect: () => void
}) {
  const m = MATERIALS[detection.material]
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent p-6 pt-20">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <div className="flex items-center gap-4 text-white">
          <span
            className={`flex size-16 shrink-0 items-center justify-center rounded-2xl ${m.solid} ${
              detection.material === 'plastico' ? 'text-ink' : 'text-white'
            }`}
          >
            <m.icon size={32} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-2xl font-black">{m.label}</p>
            <p className="truncate text-sm text-white/80">{detection.title}</p>
          </div>
          <span className="ml-auto flex shrink-0 gap-1" aria-label={`Confiança ${detection.confidence} de 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={`size-2.5 rounded-full ${n <= detection.confidence ? 'bg-brand' : 'bg-white/30'}`} />
            ))}
          </span>
        </div>
        <div className="flex gap-3">
          <button onClick={onCorrect} className="flex-1 rounded-2xl border-2 border-white/70 py-3 font-extrabold text-white active:opacity-90">
            Corrigir
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-2xl bg-brand py-3 font-extrabold text-white active:opacity-90">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

function CorrecaoOverlay({ onPick, onBack }: { onPick: (material: MaterialId) => void; onBack: () => void }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 pt-16">
      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-center font-extrabold text-white">Qual é o material?</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ORDEM.map((id) => {
            const m = MATERIALS[id]
            return (
              <button
                key={id}
                onClick={() => onPick(id)}
                className={`flex flex-col items-center gap-2 rounded-2xl ${m.soft} px-2 py-3 active:scale-95`}
              >
                <span className={`flex size-10 items-center justify-center rounded-xl text-white ${m.solid}`}>
                  <m.icon size={20} />
                </span>
                <span className="text-xs font-bold text-ink">{m.label}</span>
              </button>
            )
          })}
        </div>
        <button onClick={onBack} className="mt-3 w-full text-sm font-bold text-white/80">
          Voltar
        </button>
      </div>
    </div>
  )
}
