import type { Role } from '../auth/roles'
import type { MaterialId } from '../lib/materials'

// MOCK: quando o back existir, estes dados vêm da API (ex.: GET /dashboard, GET /dispositivos).

export const ITEMS_TODAY = 247

export type Kpi = {
  id: string
  label: string
  value: string
  delta: string
  highlight?: boolean
}

export const KPIS: Kpi[] = [
  { id: 'volume', label: 'VOLUME TOTAL COLETADO', value: '2.450 kg', delta: '+12.4%' },
  { id: 'valor', label: 'VALOR ESTIMADO DO LOTE', value: 'R$ 3.280,00', delta: '+8.3%', highlight: true },
  { id: 'itens', label: 'ITENS CLASSIFICADOS', value: '1.847', delta: '+15.1%' },
  { id: 'correcao', label: 'TAXA DE CORREÇÃO', value: '4,2%', delta: '-1.2%' },
]

// kg coletados em cada um dos últimos 30 dias (do mais antigo ao de hoje)
export const DAILY_KG: number[] = Array.from(
  { length: 30 },
  (_, i) => Math.round(45 + i * 2.4 + ((i * 37) % 11) * 3),
)

export const MIX: { material: MaterialId; percent: number }[] = [
  { material: 'plastico', percent: 42 },
  { material: 'papel', percent: 28 },
  { material: 'metal', percent: 15 },
  { material: 'vidro', percent: 10 },
  { material: 'organico', percent: 5 },
]

// Volume total (kg) por período, usado na Composição
export const TOTAL_KG: Record<'7' | '30' | '90', number> = { '7': 570, '30': 2450, '90': 7100 }

// ---------- Usuários da cooperativa ----------
export type CoopUser = {
  id: string // ID de usuário (login)
  name: string
  role: Role
  email?: string // opcional (depende da cooperativa)
  phone: string
  active: boolean // "excluir" = inativar (mantém o histórico)
}

export const COOP_USERS: CoopUser[] = [
  { id: 'RV-0001', name: 'Ana Maria Castro', role: 'gerente', email: 'gerente@ecotriall.com', phone: '(11) 98765-4321', active: true },
  { id: 'RV-0002', name: 'Carlos Santos', role: 'coordenador', email: 'coordenador@ecotriall.com', phone: '(11) 97654-3210', active: true },
  { id: 'RV-1024', name: 'João Silva', role: 'catador', email: 'catador@ecotriall.com', phone: '(11) 99123-4567', active: true },
  { id: 'RV-1025', name: 'Marcos Lima', role: 'catador', phone: '(11) 99234-5678', active: true },
  { id: 'RV-1026', name: 'Maria Oliveira', role: 'catador', phone: '(11) 99345-6789', active: true },
  { id: 'RV-1027', name: 'Lucas Santos', role: 'catador', phone: '(11) 99456-7890', active: true },
  { id: 'RV-1028', name: 'Juliana Santos', role: 'catador', phone: '(11) 99567-8901', active: false },
]

// ---------- Dispositivos ----------
export type Device = {
  id: number
  name: string
  location: string
  active: boolean
  catadorId: string | null // quem opera (vínculo feito pelo gerente ou coordenador)
  battery: number // %
  signal: string
  lastActivity: string
}

export const DEVICES: Device[] = [
  { id: 1, name: 'Lixeira Inteligente #01', location: 'Galpão Principal - Setor A', active: true, catadorId: 'RV-1024', battery: 94, signal: 'Excelente', lastActivity: 'Há 2 min' },
  { id: 2, name: 'Lixeira Inteligente #02', location: 'Área de Triagem Secundária', active: true, catadorId: 'RV-1026', battery: 78, signal: 'Excelente', lastActivity: 'Há 15 min' },
  { id: 3, name: 'Lixeira Inteligente #03', location: 'Entrada Recepção de Lotes', active: false, catadorId: 'RV-1025', battery: 12, signal: 'Excelente', lastActivity: 'Ontem às 18:40' },
  { id: 4, name: 'Lixeira Inteligente #04', location: 'Área Externa - Doca', active: true, catadorId: 'RV-1027', battery: 66, signal: 'Boa', lastActivity: 'Há 4 min' },
]

export const deviceShort = (d: Device) => d.name.replace('Inteligente ', '')

// ---------- Desempenho por catador (30 dias) ----------
export type CatadorStats = {
  kg: number
  items: number
  accuracy: number // % de itens que NÃO precisaram de correção
  corrections: number
  weekKg: number[] // últimos 7 dias (seg a dom)
  mix: { material: MaterialId; percent: number }[]
}

export const CATADOR_STATS: Record<string, CatadorStats> = {
  'RV-1024': { kg: 612, items: 486, accuracy: 97.1, corrections: 14, weekKg: [18, 24, 21, 27, 25, 14, 9], mix: [{ material: 'plastico', percent: 46 }, { material: 'papel', percent: 26 }, { material: 'metal', percent: 14 }, { material: 'vidro', percent: 9 }, { material: 'organico', percent: 5 }] },
  'RV-1025': { kg: 438, items: 351, accuracy: 94.3, corrections: 20, weekKg: [14, 16, 19, 15, 18, 10, 6], mix: [{ material: 'plastico', percent: 38 }, { material: 'papel', percent: 31 }, { material: 'metal', percent: 17 }, { material: 'vidro', percent: 11 }, { material: 'organico', percent: 3 }] },
  'RV-1026': { kg: 695, items: 540, accuracy: 96.0, corrections: 22, weekKg: [22, 25, 28, 24, 29, 17, 11], mix: [{ material: 'plastico', percent: 41 }, { material: 'papel', percent: 29 }, { material: 'metal', percent: 15 }, { material: 'vidro', percent: 10 }, { material: 'organico', percent: 5 }] },
  'RV-1027': { kg: 705, items: 470, accuracy: 91.7, corrections: 39, weekKg: [20, 23, 26, 30, 27, 19, 12], mix: [{ material: 'plastico', percent: 43 }, { material: 'papel', percent: 25 }, { material: 'metal', percent: 16 }, { material: 'vidro', percent: 11 }, { material: 'organico', percent: 5 }] },
  'RV-1028': { kg: 0, items: 0, accuracy: 0, corrections: 0, weekKg: [0, 0, 0, 0, 0, 0, 0], mix: [] },
}

// ---------- Correções (catador corrigiu a classificação da IA) ----------
export type Correction = {
  id: number
  device: string
  from: string
  to: string
  by: string
  confidence: number
  when: string
  ageDays: number // para os filtros Hoje / Semana / Mês
}

export const CORRECTIONS: Correction[] = [
  { id: 1, device: 'Lixeira #02', from: 'PET Verde', to: 'PET Transparente', by: 'Maria Oliveira', confidence: 98, when: 'Há 10 min', ageDays: 0 },
  { id: 2, device: 'Lixeira #01', from: 'Lata de alumínio', to: 'Lata de aço', by: 'João Silva', confidence: 92, when: 'Há 1 hora', ageDays: 0 },
  { id: 3, device: 'Lixeira #04', from: 'Vidro âmbar', to: 'Vidro incolor', by: 'Lucas Santos', confidence: 84, when: 'Há 3 horas', ageDays: 0 },
  { id: 4, device: 'Lixeira #02', from: 'Papelão', to: 'Papel branco', by: 'Maria Oliveira', confidence: 96, when: 'Hoje, 10:24', ageDays: 0 },
  { id: 5, device: 'Lixeira #03', from: 'PP (Polipropileno)', to: 'PS (Poliestireno)', by: 'Marcos Lima', confidence: 81, when: 'Ontem, 17:02', ageDays: 1 },
  { id: 6, device: 'Lixeira #01', from: 'PET Colorido', to: 'PET Verde', by: 'João Silva', confidence: 89, when: 'Há 3 dias', ageDays: 3 },
  { id: 7, device: 'Lixeira #04', from: 'Jornal/Revista', to: 'Papel misto', by: 'Lucas Santos', confidence: 93, when: 'Há 5 dias', ageDays: 5 },
  { id: 8, device: 'Lixeira #02', from: 'Filme plástico', to: 'PEAD Branco', by: 'Maria Oliveira', confidence: 79, when: 'Há 12 dias', ageDays: 12 },
  { id: 9, device: 'Lixeira #03', from: 'Alumínio (outros)', to: 'Lata de alumínio', by: 'Marcos Lima', confidence: 90, when: 'Há 20 dias', ageDays: 20 },
]

// ---------- Relatórios ----------
export type ReportType = { id: string; label: string; format: string; financial?: boolean }

export const REPORT_TYPES: ReportType[] = [
  { id: 'fechamento', label: 'Relatório de Fechamento', format: 'PDF Completo' },
  { id: 'inventario', label: 'Inventário Consolidado', format: 'Planilha CSV' },
  { id: 'produtividade', label: 'Produtividade Mensal - Catadores', format: 'PDF Completo' },
  { id: 'financeiro', label: 'Balanço Financeiro de Triagem', format: 'PDF Econômico', financial: true },
]

export type Report = {
  id: number
  title: string
  format: string
  period: string
  status: 'ready' | 'email'
  financial?: boolean
}

export const REPORTS: Report[] = [
  { id: 1, title: 'Relatório de Fechamento - Lote #142', format: 'PDF Completo', period: '01/05 - 15/05/2026', status: 'ready' },
  { id: 2, title: 'Inventário Consolidado - Lixeira 03', format: 'Planilha CSV', period: 'Abril/2026', status: 'ready' },
  { id: 3, title: 'Produtividade Mensal - Catadores', format: 'PDF Completo', period: 'Abril/2026', status: 'ready' },
  { id: 4, title: 'Balanço Financeiro de Triagem', format: 'PDF Econômico', period: 'Abril/2026', status: 'email', financial: true },
]

export const REPORT_PERIODS = ['Últimos 7 dias', 'Últimos 30 dias', 'Mês anterior']

// ---------- Cooperativa ----------
export type Coop = { razao: string; cnpj: string; endereco: string }

export const COOP: Coop = {
  razao: 'Cooperativa Recicla Vida Ltda',
  cnpj: '12.345.678/0001-90',
  endereco: 'Rua das Flores, 120 - Campinas/SP',
}