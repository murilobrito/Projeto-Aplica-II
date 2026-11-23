import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Leaf, LogOut } from 'lucide-react'
import { COOP_NAME } from '../../lib/config'
import { MATERIALS, type MaterialId } from '../../lib/materials'
import { useCamera } from '../../lib/useCamera'
import { apiClassificar, apiCorrecao } from '../../lib/api'
import { fakeClassify, type Detection } from '../../mocks/captura'

// 1x1 JPEG mínimo (SOI+EOI): enviado quando a câmera não está disponível.
const FOTO_VAZIA = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' })
import { ConfirmacaoView } from './ConfirmacaoView'
import { CorrecaoView } from './CorrecaoView'
import { EsperaView } from './EsperaView'
import { NaoIdentificadoView } from './NaoIdentificadoView'
import { ResultadoView } from './ResultadoView'

type Step = 'espera' | 'resultado' | 'naoid' | 'correcao' | 'confirmacao'

// Fluxo do celular (MVP): espera -> resultado -> (confirmar | corrigir) -> registrado -> espera...
// Rota pública (/captura): não exige login, para demonstração.
export function CapturaPage() {
  const { stream, failed } = useCamera()
  const [step, setStep] = useState<Step>('espera')
  const [detection, setDetection] = useState<Detection | null>(null)
  const [registered, setRegistered] = useState<{ material: MaterialId; title: string } | null>(null)
  const lastMaterial = useRef<MaterialId | undefined>(undefined)
  const detectando = useRef(false)

  // Envia a foto ao backend (/classificar). Se o backend estiver fora,
  // cai no mock para a demonstração não travar.
  const detect = useCallback(async (foto: Blob | null) => {
    if (detectando.current) return
    detectando.current = true
    try {
      let result: Detection
      try {
        result = await apiClassificar(foto ?? FOTO_VAZIA)
      } catch {
        result = fakeClassify(lastMaterial.current)
      }
      if (result.detectado === false) {
        // IA não reconheceu nada: pede para aproximar, sem registrar coleta
        setStep('naoid')
      } else {
        lastMaterial.current = result.material
        setDetection(result)
        setStep('resultado')
      }
    } finally {
      detectando.current = false
    }
  }, [])

  const next = useCallback(() => setStep('espera'), [])

  function confirm() {
    if (!detection) return
    setRegistered({ material: detection.material, title: detection.title })
    setStep('confirmacao')
  }

  // Envia { detectado, corrigido } para a API: vira dado rotulado para re-treino.
  function correct(material: MaterialId) {
    if (detection) {
      apiCorrecao({
        detectado: detection.material,
        corrigido: material,
        title: detection.title,
        confidence: detection.confidence,
      }).catch(() => {
        // correção é melhoria do modelo, não bloqueia o fluxo do catador
      })
    }
    setRegistered({ material, title: MATERIALS[material].label })
    setStep('confirmacao')
  }

  const background =
    step === 'resultado' && detection
      ? MATERIALS[detection.material].soft
      : step === 'confirmacao'
        ? 'bg-brand-light'
        : 'bg-surface'

  return (
    <div className={`mx-auto flex min-h-dvh max-w-md flex-col gap-3 p-4 transition-colors ${background}`}>
      {step !== 'correcao' && step !== 'confirmacao' && (
                <header className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand text-white">
              <Leaf size={16} />
            </span>
            <span className="text-sm font-extrabold text-ink">{COOP_NAME}</span>
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
      )}

      {step === 'espera' && <EsperaView stream={stream} cameraFailed={failed} onDetect={detect} />}
      {step === 'resultado' && detection && (
        <ResultadoView detection={detection} onConfirm={confirm} onCorrect={() => setStep('correcao')} />
      )}
      {step === 'naoid' && <NaoIdentificadoView onRetry={next} />}
      {step === 'correcao' && <CorrecaoView onPick={correct} onBack={() => setStep('resultado')} />}
      {step === 'confirmacao' && registered && (
        <ConfirmacaoView material={registered.material} title={registered.title} onDone={next} />
      )}
    </div>
  )
}