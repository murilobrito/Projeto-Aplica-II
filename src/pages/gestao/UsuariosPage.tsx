import { Link } from 'react-router'
import { Plus } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { ROLE_LABEL } from '../../auth/roles'
import { can } from '../../auth/permissions'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { useGestao } from '../../gestao/GestaoContext'
import { deviceShort } from '../../mocks/gestao'

export function UsuariosPage() {
  const { user } = useAuth()
  const { users, devices, setUserActive } = useGestao()
  if (!user) return null

  // Gerente vê todo mundo; coordenador só gerencia catadores
  const isGerente = can(user.role, 'usuarios:criar-gerente')
  const list = isGerente ? users : users.filter((u) => u.role === 'catador')

  function detail(role: string, id: string) {
    if (role === 'catador') {
      const d = devices.find((x) => x.catadorId === id)
      return `Dispositivo: ${d ? deviceShort(d) : 'Nenhum'}`
    }
    return role === 'gerente' ? 'Acesso total' : 'Operação do dia a dia'
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-ink">{isGerente ? 'Usuários da Cooperativa' : 'Catadores'}</h1>

      <Link
        to="/gestao/usuarios/novo"
        className="flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white"
      >
        <Plus size={18} />
        Novo Usuário
      </Link>

      <ul className="flex flex-col gap-3">
        {list.map((u) => (
          <li key={u.id}>
            <Card className={u.active ? '' : 'opacity-70'}>
              <div className="flex items-start gap-3">
                <Avatar name={u.name} className="size-11 text-sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-extrabold text-ink">{u.name}</p>
                    <span className={`text-xs font-bold ${u.active ? 'text-brand' : 'text-ink-subtle'}`}>
                      ● {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant={u.role === 'catador' ? 'success' : 'warning'} className="px-2 py-0.5 text-[10px] uppercase">
                      {ROLE_LABEL[u.role]}
                    </Badge>
                    <span className="text-xs text-ink-muted">{detail(u.role, u.id)}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-subtle">{u.email ?? `ID ${u.id}`}</p>
                </div>
              </div>

              {(u.role === 'catador' || (isGerente && u.id !== user.loginId)) && (
                <div className="mt-3 flex gap-4 border-t border-black/5 pt-3 text-xs font-bold">
                  {u.role === 'catador' && (
                    <Link to={`/gestao/equipe/${u.id}`} className="text-brand">
                      Ver desempenho
                    </Link>
                  )}
                  {/* "Excluir" = inativar (mantém o histórico). Só o gerente. */}
                  {isGerente && u.id !== user.loginId && (
                    <button
                      onClick={() => setUserActive(u.id, !u.active)}
                      className={u.active ? 'text-danger' : 'text-brand'}
                    >
                      {u.active ? 'Inativar' : 'Reativar'}
                    </button>
                  )}
                </div>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}