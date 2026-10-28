import type { MaterialId } from '../lib/materials'

// MOCK: quando o back existir, estes dados vêm da API (ex.: GET /catador/historico).

export type Period = 'hoje' | 'semana' | 'mes'

export type Classification = {
  id: number
  material: MaterialId
  item: string
  ago: string
  status: 'validado' | 'corrigido'
  period: Period
}

export const HISTORY: Classification[] = [
  { id: 1, material: 'plastico', item: 'Garrafa PET 2L', ago: 'Há 2 min', status: 'validado', period: 'hoje' },
  { id: 2, material: 'metal', item: 'Lata de Alumínio', ago: 'Há 12 min', status: 'validado', period: 'hoje' },
  { id: 3, material: 'vidro', item: 'Garrafa Long Neck', ago: 'Há 45 min', status: 'corrigido', period: 'hoje' },
  { id: 4, material: 'papel', item: 'Caixa de Papelão', ago: 'Há 1h', status: 'validado', period: 'hoje' },
  { id: 5, material: 'plastico', item: 'Embalagem Detergente', ago: 'Há 2h', status: 'validado', period: 'hoje' },
  { id: 6, material: 'metal', item: 'Lata de Conserva', ago: 'Há 3h', status: 'validado', period: 'hoje' },
  { id: 7, material: 'papel', item: 'Jornal', ago: 'Ontem, 16:20', status: 'validado', period: 'semana' },
  { id: 8, material: 'vidro', item: 'Pote de Conserva', ago: 'Ontem, 11:05', status: 'validado', period: 'semana' },
  { id: 9, material: 'plastico', item: 'Garrafa PET Verde', ago: 'Terça, 09:40', status: 'corrigido', period: 'semana' },
  { id: 10, material: 'metal', item: 'Lata de Refrigerante', ago: '12 out', status: 'validado', period: 'mes' },
  { id: 11, material: 'papel', item: 'Papelão Ondulado', ago: '10 out', status: 'validado', period: 'mes' },
]

export const PERFORMANCE = {
  itemsToday: 147,
  deltaVsYesterday: '+12% vs. ontem',
  accuracy: 95.8,
  streakDays: 5,
  // % da meta diária atingido em cada dia (0 a 100)
  week: [
    { day: 'Seg', value: 62 },
    { day: 'Ter', value: 82 },
    { day: 'Qua', value: 46 },
    { day: 'Qui', value: 92 },
    { day: 'Sex', value: 86 },
    { day: 'Sáb', value: 56 },
    { day: 'Dom', value: 26 },
  ],
}

export type Collector = {
  id: number
  name: string
  lastSignal: string
  online: boolean
  itemsToday: number
}

export const COLLECTORS: Collector[] = [
  { id: 1, name: 'Coletor Praça Matriz', lastSignal: 'Há 2 min', online: true, itemsToday: 84 },
  { id: 2, name: 'Coletor Terminal Sul', lastSignal: 'Há 10 min', online: true, itemsToday: 45 },
  { id: 3, name: 'Coletor Parque Ecológico', lastSignal: 'Há 4 horas', online: false, itemsToday: 18 },
]

export const HOME = {
  itemsToday: 24,
  deltaVsYesterday: '+12% que ontem',
  accuracy: 92,
  streakDays: 5,
  device: { name: 'Lixeira #01 - Galpão A', online: true, activeSince: 'Ativa há 10 min atrás' },
}

export const AFFILIATION = { coop: 'Coop Recicla Vida', since: 'Sócio Cooperado desde 2023' }