import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Role } from '../auth/roles'
import {
  apiAtualizarBasePrice,
  apiAtualizarCooperativa,
  apiAtualizarItem,
  apiAtualizarUsuario,
  apiCategorias,
  apiCooperativa,
  apiCriarUsuario,
  apiDispositivos,
  apiUsuarios,
  apiVincular,
} from '../lib/api'
import { COOP, COOP_USERS, DEVICES, type Coop, type CoopUser, type Device } from '../mocks/gestao'
import { CATEGORIES, type Category, type Item } from '../mocks/categorias'

// MOCK: guarda em memória o que o gerente/coordenador altera (vínculos, usuários, preços).
// Quando o back existir, cada função vira uma chamada à API e isto passa a ser TanStack Query.

export type NewUser = { name: string; role: Role; email?: string; phone: string; deviceId?: number | null }

type GestaoState = {
  devices: Device[]
  users: CoopUser[]
  categories: Category[]
  coop: Coop
  assignDevice: (deviceId: number, catadorId: string | null) => void
  addUser: (data: NewUser) => Promise<CoopUser>
  setUserActive: (id: string, active: boolean) => void
  updateItem: (categoryId: string, itemId: string, patch: Partial<Pick<Item, 'price' | 'minConfidence' | 'active'>>) => void
  setBasePrice: (categoryId: string, price: number) => void
  updateCoop: (patch: Partial<Coop>) => void
}

const GestaoContext = createContext<GestaoState | null>(null)

// IDs automáticos: catadores 1xxx, gerente/coordenador 0xxx
export function nextUserId(users: CoopUser[], role: Role): string {
  const isCatador = role === 'catador'
  const numbers = users
    .map((u) => Number(u.id.replace('RV-', '')))
    .filter((n) => (isCatador ? n >= 1000 : n < 1000))
  const next = numbers.length ? Math.max(...numbers) + 1 : isCatador ? 1000 : 1
  return `RV-${String(next).padStart(4, '0')}`
}

export function GestaoProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(DEVICES)
  const [users, setUsers] = useState<CoopUser[]>(COOP_USERS)
  const [categories, setCategories] = useState<Category[]>(CATEGORIES)
  const [coop, setCoop] = useState<Coop>(COOP)

  // Carrega dispositivos e usuários do backend ao montar. Se o backend estiver
  // fora, mantém os mocks acima (a tela não fica vazia).
  // Obs.: as edições (vincular, novo usuário, inativar) ainda são em memória —
  // falta o backend expor os endpoints de escrita.
  useEffect(() => {
    let ativo = true
    apiDispositivos().then((d) => { if (ativo && d.length) setDevices(d) }).catch(() => {})
    apiUsuarios().then((u) => { if (ativo && u.length) setUsers(u) }).catch(() => {})
    apiCategorias().then((cat) => { if (ativo && cat.length) setCategories(cat) }).catch(() => {})
    apiCooperativa().then((co) => { if (ativo) setCoop(co) }).catch(() => {})
    return () => {
      ativo = false
    }
  }, [])

  // Um catador opera uma lixeira por vez: ao vincular, ele sai da anterior.
  // Atualiza na hora (otimista) e persiste no backend, que devolve a lista final.
  function assignDevice(deviceId: number, catadorId: string | null) {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) return { ...d, catadorId }
        if (catadorId && d.catadorId === catadorId) return { ...d, catadorId: null }
        return d
      }),
    )
    apiVincular(deviceId, catadorId)
      .then(setDevices)
      .catch(() => {
        // backend fora: mantém o estado otimista local
      })
  }

  async function addUser(data: NewUser): Promise<CoopUser> {
    try {
      const criado = await apiCriarUsuario({
        name: data.name,
        role: data.role,
        email: data.email,
        phone: data.phone,
        device_id: data.deviceId ?? null,
      })
      setUsers((prev) => [criado, ...prev])
      // o backend já fez o vínculo; recarrega os dispositivos para refletir
      if (data.role === 'catador' && data.deviceId) apiDispositivos().then(setDevices).catch(() => {})
      return criado
    } catch {
      // backend fora: cria localmente para a demo não travar
      const criado: CoopUser = {
        id: nextUserId(users, data.role),
        name: data.name.trim(),
        role: data.role,
        email: data.email?.trim() || undefined,
        phone: data.phone.trim(),
        active: true,
      }
      setUsers((prev) => [criado, ...prev])
      if (data.role === 'catador' && data.deviceId) assignDevice(data.deviceId, criado.id)
      return criado
    }
  }

  function setUserActive(id: string, active: boolean) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active } : u)))
    // Inativar um catador libera a lixeira dele
    if (!active) setDevices((prev) => prev.map((d) => (d.catadorId === id ? { ...d, catadorId: null } : d)))
    apiAtualizarUsuario(id, { active })
      .then((atualizado) => setUsers((prev) => prev.map((u) => (u.id === id ? atualizado : u))))
      .catch(() => {
        // backend fora: mantém o estado otimista local
      })
  }

  function updateItem(categoryId: string, itemId: string, patch: Partial<Pick<Item, 'price' | 'minConfidence' | 'active'>>) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== categoryId
          ? c
          : { ...c, groups: c.groups.map((g) => ({ ...g, items: g.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) })) },
      ),
    )
    apiAtualizarItem(itemId, patch).catch(() => {
      // backend fora: mantém o estado otimista local
    })
  }

  function setBasePrice(categoryId: string, price: number) {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, basePrice: price } : c)))
    apiAtualizarBasePrice(categoryId, price).catch(() => {
      // backend fora: mantém o estado otimista local
    })
  }

  function updateCoop(patch: Partial<Coop>) {
    setCoop((prev) => ({ ...prev, ...patch }))
    apiAtualizarCooperativa(patch).catch(() => {
      // backend fora: mantém o estado otimista local
    })
  }

  return (
    <GestaoContext.Provider
      value={{ devices, users, categories, coop, assignDevice, addUser, setUserActive, updateItem, setBasePrice, updateCoop }}
    >
      {children}
    </GestaoContext.Provider>
  )
}

export function useGestao() {
  const ctx = useContext(GestaoContext)
  if (!ctx) throw new Error('useGestao precisa estar dentro de <GestaoProvider>')
  return ctx
}