import { useEffect, useState } from 'react'

// Abre a câmera traseira do celular. Se não houver câmera ou o usuário negar,
// "failed" fica true e a tela segue funcionando em modo demonstração.
// (A câmera só funciona em https:// ou localhost.)
export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [failed, setFailed] = useState(() => !navigator.mediaDevices?.getUserMedia)

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return
    let active = true
    let current: MediaStream | null = null

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        if (!active) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        current = s
        setStream(s)
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      active = false
      current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return { stream, failed }
}