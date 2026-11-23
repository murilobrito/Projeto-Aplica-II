import type { MaterialId } from '../lib/materials'

// MOCK: simula a IA que reconhece o objeto.
// Quando o back existir, fakeClassify() vira uma chamada à API (ex.: POST /classificar com a foto)
// e a correção do catador vira POST /correcoes { detectado, corrigido }.

export type Detection = {
  material: MaterialId
  title: string // nome do objeto (aparece em "+ 1 ...")
  description: string // legenda da tela de resultado
  confidence: 1 | 2 | 3 | 4 | 5 // bolinhas
  detectado?: boolean // false quando a IA não reconheceu nada (mostra "aproxime o item")
}

const SAMPLES: Detection[] = [
  { material: 'plastico', title: 'Garrafa Plástica', description: 'Garrafa pet descartada', confidence: 4 },
  { material: 'papel', title: 'Caixa de Papelão', description: 'Caixa de papelão dobrada', confidence: 5 },
  { material: 'metal', title: 'Lata de Alumínio', description: 'Lata de refrigerante', confidence: 4 },
  { material: 'vidro', title: 'Garrafa de Vidro', description: 'Garrafa de vidro verde', confidence: 3 },
  { material: 'organico', title: 'Resto Orgânico', description: 'Casca de fruta', confidence: 3 },
]

// Espera até a "IA" reconhecer sozinha (toque na moldura reconhece na hora)
export const CAPTURE_WAIT_MS = 3500
// Tempo da tela "Item registrado!" antes da próxima captura
export const CONFIRM_MS = 2500

// Sorteia um objeto, evitando repetir o mesmo material duas vezes seguidas
export function fakeClassify(previous?: MaterialId): Detection {
  const options = SAMPLES.filter((s) => s.material !== previous)
  return options[Math.floor(Math.random() * options.length)]
}