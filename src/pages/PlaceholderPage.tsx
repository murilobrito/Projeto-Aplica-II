import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useAuth } from '../auth/AuthContext'

/** Tela provisória. Vamos trocando uma por uma pela tela real. */
export function PlaceholderPage({ title }: { title: string }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
      <Card>
        <p className="text-sm text-ink-muted">Tela em construção.</p>
      </Card>

      {/* Provisório: serve para trocar de conta e testar os dois perfis */}
      <Button variant="secondary" onClick={logout}>
        Sair ({user?.name})
      </Button>
    </div>
  )
}