import { createContext, useContext, useState, type ReactNode } from 'react'
import { DEMO_PASSWORD, MOCK_USERS, type User } from '../mocks/users'

const STORAGE_KEY = 'ecotriall:user'

type AuthState = {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function saveUser(user: User | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // sem localStorage (aba privada etc.): a sessão só dura até recarregar a página
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser)

  async function login(email: string, password: string) {
    await new Promise((resolve) => setTimeout(resolve, 400)) // simula a rede
    const found = MOCK_USERS.find((u) => u.email === email.trim().toLowerCase())
    if (!found || password !== DEMO_PASSWORD) {
      throw new Error('E-mail ou senha incorretos')
    }
    saveUser(found)
    setUser(found)
    return found
  }

  function logout() {
    saveUser(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}