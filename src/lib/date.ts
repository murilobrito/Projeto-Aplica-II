export function greeting(date: Date) {
  const hour = date.getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

// Ex.: "Quinta-feira, 15 out"
export function formatToday(date: Date) {
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  const dayMonth = date
    .toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
    .replace(' de ', ' ')
    .replace('.', '')
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${dayMonth}`
}