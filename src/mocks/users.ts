import type { Role } from '../auth/roles'

export type User = {
  name: string
  email: string
  role: Role
}

// MOCK: quando o back existir, isto vira POST /auth/login e a resposta traz o usuário (e o JWT).
export const DEMO_PASSWORD = '123456'

export const MOCK_USERS: User[] = [
  { name: 'Ana Maria Castro', email: 'coordenador@ecotriall.coop', role: 'coordenador' },
  { name: 'Carlos Santos', email: 'admin@ecotriall.coop', role: 'admin' },
  { name: 'João Silva', email: 'catador@ecotriall.coop', role: 'catador' },
]