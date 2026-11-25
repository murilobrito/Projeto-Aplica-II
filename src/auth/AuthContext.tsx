import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ApiError, apiLogin, apiMe, getToken, setAoExpirarSessao, setToken } from '../lib/api'
import { type User } from '../mocks/users'

const STORAGE_KEY = 'ecotriall:user:v2'

type AuthState = {
  user: User | null
  login: (identifier: string, password: string) => Promise<User>
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

  // "identifier" pode ser o e-mail OU o ID de usuário
  async function login(identifier: string, password: string) {
    const { user: autenticado, token } = await apiLogin(identifier, password)
    setToken(token)
    saveUser(autenticado)
    setUser(autenticado)
    return autenticado
  }

  function logout() {
    setToken(null)
    saveUser(null)
    setUser(null)
  }

  // Não basta confiar no que ficou salvo no navegador: ao abrir o app, pergunta ao back
  // se a sessão ainda vale. Se não valer (token vencido, usuário inativado), desloga.
  useEffect(() => {
    setAoExpirarSessao(logout)
    if (loadUser()) {
      if (!getToken()) {
        logout()
      } else {
        apiMe()
          .then((atual) => {
            saveUser(atual)
            setUser(atual)
          })
          .catch((e) => {
            // back fora do ar não derruba a sessão; só 401 (já tratado em api.ts)
            if (e instanceof ApiError && e.status === 401) logout()
          })
      }
    }
    return () => setAoExpirarSessao(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}