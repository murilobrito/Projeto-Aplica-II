import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Role } from '../auth/roles'
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
  addUser: (data: NewUser) => CoopUser
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

  // Um catador opera uma lixeira por vez: ao vincular, ele sai da anterior
  function assignDevice(deviceId: number, catadorId: string | null) {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) return { ...d, catadorId }
        if (catadorId && d.catadorId === catadorId) return { ...d, catadorId: null }
        return d
      }),
    )
  }

  function addUser(data: NewUser) {
    const created: CoopUser = {
      id: nextUserId(users, data.role),
      name: data.name.trim(),
      role: data.role,
      email: data.email?.trim() || undefined,
      phone: data.phone.trim(),
      active: true,
    }
    setUsers((prev) => [created, ...prev])
    if (data.role === 'catador' && data.deviceId) assignDevice(data.deviceId, created.id)
    return created
  }

  function setUserActive(id: string, active: boolean) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active } : u)))
    // Inativar um catador libera a lixeira dele
    if (!active) setDevices((prev) => prev.map((d) => (d.catadorId === id ? { ...d, catadorId: null } : d)))
  }

  function updateItem(categoryId: string, itemId: string, patch: Partial<Pick<Item, 'price' | 'minConfidence' | 'active'>>) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== categoryId
          ? c
          : { ...c, groups: c.groups.map((g) => ({ ...g, items: g.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) })) },
      ),
    )
  }

  function setBasePrice(categoryId: string, price: number) {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, basePrice: price } : c)))
  }

  function updateCoop(patch: Partial<Coop>) {
    setCoop((prev) => ({ ...prev, ...patch }))
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