import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Leaf, LogOut } from 'lucide-react'
import { COOP_NAME } from '../../lib/config'
import { MATERIALS, type MaterialId } from '../../lib/materials'
import { useCamera } from '../../lib/useCamera'
import { fakeClassify, type Detection } from '../../mocks/captura'
import { ConfirmacaoView } from './ConfirmacaoView'
import { CorrecaoView } from './CorrecaoView'
import { EsperaView } from './EsperaView'
import { ResultadoView } from './ResultadoView'

type Step = 'espera' | 'resultado' | 'correcao' | 'confirmacao'

// Fluxo do celular (MVP): espera -> resultado -> (confirmar | corrigir) -> registrado -> espera...
// Rota pública (/captura): não exige login, para demonstração.
export function CapturaPage() {
  const { stream, failed } = useCamera()
  const [step, setStep] = useState<Step>('espera')
  const [detection, setDetection] = useState<Detection | null>(null)
  const [registered, setRegistered] = useState<{ material: MaterialId; title: string } | null>(null)
  const lastMaterial = useRef<MaterialId | undefined>(undefined)

  const detect = useCallback(() => {
    const result = fakeClassify(lastMaterial.current)
    lastMaterial.current = result.material
    setDetection(result)
    setStep('resultado')
  }, [])

  const next = useCallback(() => setStep('espera'), [])

  function confirm() {
    if (!detection) return
    setRegistered({ material: detection.material, title: detection.title })
    setStep('confirmacao')
  }

  // Futuro: aqui o app envia { detectado, corrigido } para a API treinar o modelo
  function correct(material: MaterialId) {
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
      {step === 'correcao' && <CorrecaoView onPick={correct} onBack={() => setStep('resultado')} />}
      {step === 'confirmacao' && registered && (
        <ConfirmacaoView material={registered.material} title={registered.title} onDone={next} />
      )}
    </div>
  )
}