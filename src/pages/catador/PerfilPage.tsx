import { useState, type FormEvent } from 'react'
import { Users } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { ROLE_LABEL } from '../../auth/roles'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { AFFILIATION } from '../../mocks/catador'

export function PerfilPage() {
  const { user, logout } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  if (!user) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha precisa ter pelo menos 6 caracteres' })
      return
    }
    // Aqui, no futuro: chamar a API para trocar a senha
    setMessage({ type: 'ok', text: 'Senha alterada com sucesso!' })
    setCurrentPassword('')
    setNewPassword('')
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center gap-4">
        <Avatar name={user.name} className="size-16 text-xl" />
        <div className="min-w-0">
          <p className="text-lg font-extrabold text-ink">{user.name}</p>
          <p className="truncate text-sm text-ink-muted">{user.email ?? `ID ${user.loginId}`}</p>
          <Badge variant="success" className="mt-1 uppercase">
            {ROLE_LABEL[user.role]}
          </Badge>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Afiliação</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-brand text-white">
            <Users size={18} />
          </span>
          <div>
            <p className="font-bold text-ink">{AFFILIATION.coop}</p>
            <p className="text-xs text-ink-muted">{AFFILIATION.since}</p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Alterar senha</p>
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
          <Input
            label="Senha atual"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="Nova senha"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          {message && (
            <p className={`text-sm font-medium ${message.type === 'ok' ? 'text-brand' : 'text-offline'}`}>
              {message.text}
            </p>
          )}
          <Button type="submit" fullWidth>
            Salvar Senha
          </Button>
        </form>
      </Card>

      <Button variant="secondary" fullWidth onClick={logout}>
        Sair da conta
      </Button>
    </div>
  )
}