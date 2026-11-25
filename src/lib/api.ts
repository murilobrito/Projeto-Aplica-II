import type { MaterialId } from './materials'
import type { Detection } from '../mocks/captura'
import type { User } from '../mocks/users'
import type { Coop, CoopUser, Correction, Device, Kpi } from '../mocks/gestao'
import type { Category } from '../mocks/categorias'

// URL do backend. Em produção defina VITE_API_URL no .env do front.
export const API_URL: string =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ??
  'http://localhost:8000'

const TOKEN_KEY = 'ecotriall:token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // sem localStorage (aba privada): segue sem persistir o token
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// O AuthProvider registra aqui o que fazer quando o back diz que a sessão não vale mais (401)
let aoExpirarSessao: (() => void) | null = null
export function setAoExpirarSessao(fn: (() => void) | null): void {
  aoExpirarSessao = fn
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    let mensagem = `Erro ${res.status}`
    try {
      const corpo = await res.json()
      if (typeof corpo?.detail === 'string') mensagem = corpo.detail
    } catch {
      // resposta sem JSON: mantém a mensagem padrão
    }
    // 401 fora do login = token expirado/inválido ou usuário desativado: derruba a sessão
    if (res.status === 401 && token && path !== '/auth/login') aoExpirarSessao?.()
    throw new ApiError(mensagem, res.status)
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}

export function apiLogin(identifier: string, password: string): Promise<{ user: User; token: string }> {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  })
}

export function apiMe(): Promise<User> {
  return request('/auth/me')
}

export function apiClassificar(foto: Blob): Promise<Detection> {
  const form = new FormData()
  form.append('file', foto, 'captura.jpg')
  return request('/classificar', { method: 'POST', body: form })
}

export type CorrecaoPayload = {
  detectado: MaterialId
  corrigido: MaterialId
  title?: string
  confidence?: number
  device_id?: number
}

export function apiCorrecao(payload: CorrecaoPayload): Promise<{ ok: boolean; id: number }> {
  return request('/correcoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

// ---------- Gestão (leituras) ----------
export type DashboardData = {
  kpis: Kpi[]
  mix: { material: MaterialId; percent: number }[]
  dailyKg: number[]
  totalKg: Record<string, number>
  itemsToday: number
}

export function apiDashboard(): Promise<DashboardData> {
  return request('/dashboard')
}

export function apiDispositivos(): Promise<Device[]> {
  return request('/dispositivos')
}

export function apiUsuarios(): Promise<CoopUser[]> {
  return request('/usuarios')
}

export function apiCatadores(): Promise<CoopUser[]> {
  return request('/catadores')
}

// ---------- Gestão (escrita) ----------
export type NovoUsuarioPayload = {
  name: string
  role: string
  email?: string
  phone: string
  device_id?: number | null
}

export function apiCriarUsuario(payload: NovoUsuarioPayload): Promise<CoopUser> {
  return request('/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function apiAtualizarUsuario(
  loginId: string,
  patch: { active?: boolean; name?: string; phone?: string; email?: string },
): Promise<CoopUser> {
  return request(`/usuarios/${loginId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}

export function apiVincular(deviceId: number, catadorId: string | null): Promise<Device[]> {
  return request(`/dispositivos/${deviceId}/vinculo`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ catador_id: catadorId }),
  })
}

export function apiCategorias(): Promise<Category[]> {
  return request('/categorias')
}

export function apiAtualizarBasePrice(categoriaId: string, basePrice: number): Promise<unknown> {
  return request(`/categorias/${categoriaId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base_price: basePrice }),
  })
}

export function apiAtualizarItem(
  itemId: string,
  patch: { price?: number; minConfidence?: number; active?: boolean },
): Promise<unknown> {
  return request(`/itens/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price: patch.price, min_confidence: patch.minConfidence, active: patch.active }),
  })
}

export function apiCooperativa(): Promise<Coop> {
  return request('/cooperativa')
}

export function apiAtualizarCooperativa(patch: Partial<Coop>): Promise<Coop> {
  return request('/cooperativa', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}

export function apiCorrecoes(): Promise<Correction[]> {
  return request('/correcoes')
}
