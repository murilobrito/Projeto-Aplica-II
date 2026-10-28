import type { MaterialId } from '../lib/materials'

// MOCK: no back isto vira GET/PATCH /categorias.
// Taxonomia: Categoria > Subtipo (grupo) > Variação.  Id da variação = slug (ex.: plastico_pet_transparente).
// Novas classes exigem retreino do modelo de IA, por isso só a equipe EcoTriall (admin) cria.
// O gerente edita apenas: preço, confiança mínima e liga/desliga.

export type Item = {
  id: string // slug
  label: string
  price: number // R$/kg
  minConfidence: number // %
  active: boolean
  hard?: boolean // difícil de distinguir (IA erra mais)
}

export type Group = { id: string; label: string; items: Item[] }

export type Category = {
  id: Exclude<MaterialId, 'outros'>
  basePrice: number // usado na estimativa da Composição
  tag?: string
  groups: Group[]
}

const item = (id: string, label: string, price: number, hard = false): Item => ({
  id,
  label,
  price,
  minConfidence: hard ? 85 : 90,
  active: true,
  hard,
})

export const CATEGORIES: Category[] = [
  {
    id: 'plastico',
    basePrice: 1.5,
    tag: 'Reciclável Especial',
    groups: [
      {
        id: 'pet',
        label: 'PET (Polietileno Tereftalato)',
        items: [
          item('plastico_pet_transparente', 'Transparente (Garrafas)', 2.2),
          item('plastico_pet_verde', 'Verde (Bebidas/Gás)', 1.8),
          item('plastico_pet_colorido', 'Colorido', 1.6),
        ],
      },
      {
        id: 'pead',
        label: 'PEAD (Polietileno de Alta Densidade)',
        items: [item('plastico_pead_branco', 'Branco', 1.9), item('plastico_pead_colorido', 'Colorido', 1.4)],
      },
      { id: 'pp', label: 'PP (Polipropileno)', items: [item('plastico_pp', 'PP (Polipropileno)', 1.2, true)] },
      { id: 'ps', label: 'PS (Poliestireno)', items: [item('plastico_ps', 'PS (Poliestireno)', 0.8, true)] },
      { id: 'filme', label: 'Filme plástico', items: [item('plastico_filme', 'Filme plástico', 0.9)] },
    ],
  },
  {
    id: 'papel',
    basePrice: 1.0,
    groups: [
      { id: 'papelao', label: 'Papelão', items: [item('papel_papelao', 'Papelão', 0.6)] },
      { id: 'branco', label: 'Papel branco', items: [item('papel_branco', 'Papel branco', 1.4)] },
      { id: 'misto', label: 'Papel misto', items: [item('papel_misto', 'Papel misto', 0.7)] },
      { id: 'jornal', label: 'Jornal/Revista', items: [item('papel_jornal_revista', 'Jornal/Revista', 0.5)] },
      { id: 'cartonado', label: 'Cartonado (longa vida)', items: [item('papel_cartonado', 'Cartonado (longa vida)', 0.4)] },
    ],
  },
  {
    id: 'metal',
    basePrice: 2.5,
    groups: [
      { id: 'lata_aluminio', label: 'Lata de alumínio', items: [item('metal_lata_aluminio', 'Lata de alumínio', 6.0)] },
      { id: 'lata_aco', label: 'Lata de aço', items: [item('metal_lata_aco', 'Lata de aço', 0.8, true)] },
      { id: 'aluminio_outro', label: 'Alumínio (outros)', items: [item('metal_aluminio_outro', 'Alumínio (outros)', 4.5)] },
      { id: 'outro', label: 'Outros metais', items: [item('metal_outro', 'Outros metais', 1.5)] },
    ],
  },
  {
    id: 'vidro',
    basePrice: 0.5,
    groups: [
      { id: 'incolor', label: 'Incolor', items: [item('vidro_incolor', 'Incolor', 0.6)] },
      { id: 'verde', label: 'Verde', items: [item('vidro_verde', 'Verde', 0.45)] },
      { id: 'ambar', label: 'Âmbar', items: [item('vidro_ambar', 'Âmbar', 0.45)] },
      { id: 'outro', label: 'Outro', items: [item('vidro_outro', 'Outro', 0.2)] },
    ],
  },
  {
    id: 'organico',
    basePrice: 0.1,
    groups: [{ id: 'organico', label: 'Orgânico', items: [item('organico', 'Orgânico', 0.1)] }],
  },
]