export type Role = 'admin' | 'gerente' | 'coordenador' | 'catador'
export type Area = 'plataforma' | 'gestao' | 'catador'

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  coordenador: 'Coordenador',
  catador: 'Catador',
}

// Admin = equipe EcoTriall (plataforma). Gerente e Coordenador usam a mesma área (/gestao),
// mas com permissões diferentes (veja permissions.ts). Catador tem a sua.
export function areaOf(role: Role): Area {
  if (role === 'admin') return 'plataforma'
  if (role === 'catador') return 'catador'
  return 'gestao'
}

export function homeOf(role: Role): string {
  return `/${areaOf(role)}`
}