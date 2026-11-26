import { useEffect, useState } from 'react'

// Busca dados ao abrir a tela e guarda o resultado. `recarregar` busca de novo.
export function useCarregar<T>(buscar: () => Promise<T>) {
  const [dados, setDados] = useState<T | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [rodada, setRodada] = useState(0)

  useEffect(() => {
    let ativo = true
    setErro(null)
    buscar()
      .then((d) => {
        if (ativo) setDados(d)
      })
      .catch((e) => {
        if (ativo) setErro(e instanceof Error ? e.message : 'Erro ao carregar')
      })
    return () => {
      ativo = false
    }
    // `buscar` é recriada a cada render; só a rodada deve disparar a busca
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodada])

  return { dados, erro, recarregar: () => setRodada((n) => n + 1) }
}