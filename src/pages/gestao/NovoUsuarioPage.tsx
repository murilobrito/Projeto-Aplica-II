import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Info } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { ROLE_LABEL, type Role } from '../../auth/roles'
import { can } from '../../auth/permissions'
import { BackHeader } from '../../components/BackHeader'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { nextUserId, useGestao } from '../../gestao/GestaoContext'

export function NovoUsuarioPage() {
  const { user } = useAuth()
  const { users, devices, addUser } = useGestao()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role>('catador')
  const [deviceId, setDeviceId] = useState('')
  if (!user) return null

  // Quais perfis este usuário pode criar (a regra vem de permissions.ts)
  const allowed = (['gerente', 'coordenador', 'catador'] as const).filter((r) => can(user.role, `usuarios:criar-${r}`))
  const freeDevices = devices.filter((d) => d.active && !d.catadorId)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    addUser({ name, role, email, phone, deviceId: deviceId ? Number(deviceId) : null })
    navigate('/gestao/usuarios')
  }

  const firstName = name.trim().split(/\s+/)[0] || 'O usuário'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <BackHeader to="/gestao/usuarios" title="Novo Usuário" />

      <p className="flex items-center gap-2 text-xs text-ink-muted">
        <Badge variant="online" className="px-2 py-0.5 text-[10px] uppercase">
          {ROLE_LABEL[user.role]}
        </Badge>
        {allowed.length > 1 ? 'Pode convidar os três perfis' : 'Pode convidar apenas catadores'}
      </p>

      <Input label="Nome completo" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input
        label="E-mail (opcional)"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Sem e-mail, o acesso é só pelo ID"
      />
      <Input label="Telefone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />

      <div>
        <p className="mb-1 text-xs font-bold uppercase text-ink-muted">Perfil</p>
        <div className="grid grid-cols-3 gap-2">
          {(['gerente', 'coordenador', 'catador'] as const).map((r) => {
            const disabled = !allowed.includes(r)
            return (
              <label
                key={r}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-bold ${
                  role === r ? 'border-brand bg-brand-light text-brand' : 'border-black/10 bg-white text-ink'
                } ${disabled ? 'opacity-40' : 'cursor-pointer'}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  disabled={disabled}
                  onChange={() => setRole(r)}
                  className="accent-brand"
                />
                {ROLE_LABEL[r]}
              </label>
            )
          })}
        </div>
        {allowed.length === 1 && (
          <p className="mt-1 text-xs text-ink-muted">Seu perfil permite criar somente catadores.</p>
        )}
      </div>

      {role === 'catador' && (
        <Select label="Dispositivo vinculado" name="device" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
          <option value="">Nenhum (vincular depois)</option>
          {freeDevices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      )}

      <Card className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase text-ink-subtle">Registro do usuário</p>
          <p className="text-xl font-extrabold text-ink">{nextUserId(users, role)}</p>
        </div>
        <Badge variant="success" className="px-2 py-0.5 text-[10px]">
          Automático
        </Badge>
      </Card>

      <div className="flex items-start gap-2 rounded-xl bg-brand-light p-3 text-sm text-brand">
        <Info size={18} className="mt-0.5 shrink-0" />
        {email.trim()
          ? `O registro é gerado automaticamente. ${firstName} receberá um convite por e-mail para definir a senha.`
          : `O registro é gerado automaticamente. ${firstName} entra pelo ID e define a senha no primeiro acesso.`}
      </div>

      <Button type="submit" fullWidth>
        Enviar convite
      </Button>
    </form>
  )
}