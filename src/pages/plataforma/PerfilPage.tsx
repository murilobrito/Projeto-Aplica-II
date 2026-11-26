import { useAuth } from '../../auth/AuthContext'
import { ROLE_LABEL } from '../../auth/roles'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'

export function PlataformaPerfilPage() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <Card className="flex flex-col items-center gap-2 py-6">
        <Avatar name={user.name} className="size-20 text-2xl" />
        <p className="text-xl font-extrabold text-ink">{user.name}</p>
        <Badge variant="online" className="uppercase">
          {ROLE_LABEL[user.role]}
        </Badge>
      </Card>

      <Card>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt className="text-ink-muted">ID de usuário</dt>
          <dd className="font-bold text-ink">{user.loginId}</dd>
          <dt className="text-ink-muted">E-mail</dt>
          <dd className="font-bold text-ink">{user.email ?? '—'}</dd>
          <dt className="text-ink-muted">Acesso</dt>
          <dd className="font-bold text-ink">Todas as cooperativas</dd>
        </dl>
      </Card>

      <button onClick={logout} className="rounded-xl bg-danger-soft py-3 text-sm font-bold text-danger">
        Sair do Painel
      </button>
    </div>
  )
}