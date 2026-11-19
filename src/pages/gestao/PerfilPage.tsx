import { useEffect, useState, type FormEvent } from 'react'
import { Lock, Pencil } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { ROLE_LABEL } from '../../auth/roles'
import { can } from '../../auth/permissions'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { useGestao } from '../../gestao/GestaoContext'
import { COOP_USERS } from '../../mocks/gestao'

export function GestaoPerfilPage() {
  const { user, logout } = useAuth()
  const { coop, updateCoop } = useGestao()
  const me = COOP_USERS.find((u) => u.id === user?.loginId)

  // MOCK: no back, "Salvar" vira PATCH /me e PATCH /cooperativa
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(me?.phone ?? '')
  const [razao, setRazao] = useState(coop.razao)
  const [cnpj, setCnpj] = useState(coop.cnpj)
  const [endereco, setEndereco] = useState(coop.endereco)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  // Quando a cooperativa chega do backend, reflete nos campos do formulário.
  useEffect(() => {
    setRazao(coop.razao)
    setCnpj(coop.cnpj)
    setEndereco(coop.endereco)
  }, [coop.razao, coop.cnpj, coop.endereco])

  if (!user) return null
  const canEditCoop = can(user.role, 'cooperativa:editar')

  function saveData(e: FormEvent) {
    e.preventDefault()
    if (canEditCoop) updateCoop({ razao, cnpj, endereco })
    setMessage({ type: 'ok', text: 'Dados salvos com sucesso!' })
  }

  function savePassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha precisa ter pelo menos 6 caracteres' })
      return
    }
    setNewPassword('')
    setShowPassword(false)
    setMessage({ type: 'ok', text: 'Senha alterada com sucesso!' })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-2 py-6">
        <Avatar name={user.name} className="size-20 text-2xl" />
        <p className="text-xl font-extrabold text-ink">{user.name}</p>
        <Badge variant="online" className="uppercase">
          {ROLE_LABEL[user.role]}
        </Badge>
      </Card>

      {message && (
        <p role="status" className={`text-sm font-bold ${message.type === 'ok' ? 'text-brand' : 'text-offline'}`}>
          {message.text}
        </p>
      )}

      <form onSubmit={saveData} className="flex flex-col gap-4">
        <h2 className="font-extrabold text-ink">Dados Pessoais</h2>
        <Input label="Nome completo" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="E-mail institucional" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Telefone de contato" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <h2 className="mt-2 flex items-center gap-2 font-extrabold text-ink">
          Informações da Cooperativa
          {!canEditCoop && <Lock size={14} className="text-ink-subtle" aria-label="Somente leitura" />}
        </h2>
        {!canEditCoop && <p className="-mt-2 text-xs text-ink-muted">Somente leitura. Apenas o gerente edita os dados da cooperativa.</p>}
        <Input label="Razão social" name="razao" value={razao} onChange={(e) => setRazao(e.target.value)} readOnly={!canEditCoop} className={canEditCoop ? '' : 'bg-black/5'} />
        <Input label="CNPJ" name="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} readOnly={!canEditCoop} className={canEditCoop ? '' : 'bg-black/5'} />
        <Input label="Endereço da sede" name="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} readOnly={!canEditCoop} className={canEditCoop ? '' : 'bg-black/5'} />

        <Button type="submit" fullWidth className="flex items-center justify-center gap-2">
          <Pencil size={16} />
          Salvar alterações
        </Button>
      </form>

      <h2 className="mt-2 font-extrabold text-ink">Segurança da Conta</h2>
      <button
        onClick={() => setShowPassword((v) => !v)}
        className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-left font-bold text-ink"
      >
        <Lock size={18} />
        Alterar Senha de Acesso
      </button>
      {showPassword && (
        <form onSubmit={savePassword} className="flex flex-col gap-3">
          <Input label="Nova senha" name="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Button type="submit" fullWidth>
            Salvar Senha
          </Button>
        </form>
      )}

      <button onClick={logout} className="mt-2 rounded-xl bg-danger-soft py-3 text-sm font-bold text-danger">
        Sair do Painel
      </button>
    </div>
  )
}