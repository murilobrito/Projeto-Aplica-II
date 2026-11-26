import type { User } from '../mocks/users'

export const APP_NAME = 'EcoTriall'
export const COOP_NAME = 'COOP RECICLA VIDA' // usado só na captura pública (sem login)

// O que aparece abaixo do logo: a cooperativa de quem está logado (o admin é da plataforma).
export function nomeCoop(user: User | null | undefined): string {
  if (user?.role === 'admin') return 'PLATAFORMA'
  // tira o " Ltda" do fim para caber na barra lateral
  return user?.cooperativa ? user.cooperativa.replace(/\s+ltda\.?$/i, '') : COOP_NAME
}