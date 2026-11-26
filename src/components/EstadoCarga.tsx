import { Card } from './Card'

// Mostra "Carregando…" ou o erro (com botão de tentar de novo) enquanto os dados não chegam
export function EstadoCarga({ erro, onTentar }: { erro: string | null; onTentar: () => void }) {
  if (!erro) return <p className="text-sm text-ink-muted">Carregando…</p>
  return (
    <Card className="flex flex-col items-start gap-3">
      <p className="text-sm font-bold text-danger">Não foi possível carregar: {erro}</p>
      <button onClick={onTentar} className="rounded-full bg-brand-light px-4 py-1.5 text-xs font-bold text-brand">
        Tentar de novo
      </button>
    </Card>
  )
}