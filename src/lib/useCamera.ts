import { useEffect, useState } from 'react'

// Abre a câmera do dispositivo (webcam do computador, câmera do notebook ou o
// celular usado como webcam). Permite escolher entre as câmeras disponíveis.
// Se não houver câmera ou o acesso for negado, "failed" fica true e a tela segue
// em modo demonstração. A câmera só funciona em https:// ou localhost.
export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [failed, setFailed] = useState(() => !navigator.mediaDevices?.getUserMedia)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState<string>()

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return
    let active = true
    let current: MediaStream | null = null

    const video = deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }

    navigator.mediaDevices
      .getUserMedia({ video, audio: false })
      .then(async (s) => {
        if (!active) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        current = s
        setStream(s)
        setFailed(false)
        try {
          const dispositivos = await navigator.mediaDevices.enumerateDevices()
          if (active) setCameras(dispositivos.filter((d) => d.kind === 'videoinput'))
        } catch {
          // alguns navegadores barram enumerateDevices; sem lista, o seletor só não aparece
        }
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      active = false
      current?.getTracks().forEach((t) => t.stop())
    }
  }, [deviceId])

  return { stream, failed, cameras, deviceId, setDeviceId }
}
