export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const kg = (n: number) =>
  `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`

export const int = (n: number) => n.toLocaleString('pt-BR')