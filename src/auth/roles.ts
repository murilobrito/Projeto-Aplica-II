export type Role = 'catador' | 'coordenador' | 'admin'
export type Area = 'admin' | 'catador'

export const ROLE_LABEL: Record<Role, string> = {
  catador: 'Catador',
  coordenador: 'Coordenador',
  admin: 'Administrador',
}

// Coordenador e Administrador usam a mesma área (/admin); Catador tem a sua (/catador)
export function areaOf(role: Role): Area {
  return role === 'catador' ? 'catador' : 'admin'
}

export function homeOf(role: Role): string {
  return `/${areaOf(role)}`
}