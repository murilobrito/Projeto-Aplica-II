import type { Role } from '../auth/roles'

export type User = {
  name: string
  loginId: string // ID de usuário (todo usuário tem)
  email?: string // opcional: depende da configuração da cooperativa
  role: Role
}

// MOCK: quando o back existir, isto vira POST /auth/login e a resposta traz o usuário (e o JWT).
export const DEMO_PASSWORD = '123456'

export const MOCK_USERS: User[] = [
  { name: 'Equipe EcoTriall', loginId: 'EC-0001', email: 'admin@ecotriall.com', role: 'admin' },
  { name: 'Ana Maria Castro', loginId: 'RV-0001', email: 'gerente@ecotriall.com', role: 'gerente' },
  { name: 'Carlos Santos', loginId: 'RV-0002', email: 'coordenador@ecotriall.com', role: 'coordenador' },
  { name: 'João Silva', loginId: 'RV-1024', email: 'catador@ecotriall.com', role: 'catador' },
  { name: 'Marcos Lima', loginId: 'RV-1025', role: 'catador' }, // sem e-mail: entra só pelo ID
]