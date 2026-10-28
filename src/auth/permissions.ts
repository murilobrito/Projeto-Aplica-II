import type { Role } from './roles'

// Quem pode fazer o quê dentro de uma cooperativa.
// IMPORTANTE: isto só esconde botões. Quem realmente protege é o back, que precisa validar o perfil em cada requisição.
const PERMISSIONS = {
  'categorias:editar': ['gerente'],
  'dispositivos:gerenciar': ['gerente'], // adicionar, editar e desativar
  'dispositivos:vincular': ['gerente', 'coordenador'], // vincular catadores
  'usuarios:criar-gerente': ['gerente'],
  'usuarios:criar-coordenador': ['gerente'],
  'usuarios:criar-catador': ['gerente', 'coordenador'],
  'cooperativa:editar': ['gerente'],
  'relatorios:financeiro': ['gerente'],
} satisfies Record<string, Role[]>

export type Permission = keyof typeof PERMISSIONS

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role)
}