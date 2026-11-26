import { useState } from 'react'
import { Link } from 'react-router'
import { Plus, Search } from 'lucide-react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { EstadoCarga } from '../../components/EstadoCarga'
import { apiCooperativas } from '../../lib/api'
import { int } from '../../lib/format'
import { useCarregar } from '../../lib/useCarregar'

export function CooperativasPage() {
  const { dados, erro, recarregar } = useCarregar(apiCooperativas)
  const [busca, setBusca] = useState('')

  const termo = busca.trim().toLowerCase()
  const lista = (dados ?? []).filter((c) => !termo || c.razao.toLowerCase().includes(termo) || c.cnpj.includes(termo))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink">Cooperativas</h1>
        <Link
          to="/plataforma/cooperativas/nova"
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          <Plus size={18} />
          Nova cooperativa
        </Link>
      </div>

      <label className="relative block sm:max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou CNPJ"
          aria-label="Buscar cooperativa"
          className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand"
        />
      </label>

      {!dados ? (
        <EstadoCarga erro={erro} onTentar={recarregar} />
      ) : lista.length === 0 ? (
        <Card className="text-sm text-ink-muted">Nenhuma cooperativa encontrada.</Card>
      ) : (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {lista.map((c) => (
            <li key={c.id}>
              <Link to={`/plataforma/cooperativas/${c.id}`}>
                <Card className="flex h-full flex-col gap-3 hover:bg-black/[0.02]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-extrabold text-ink">{c.razao}</p>
                      <p className="text-xs text-ink-muted">CNPJ {c.cnpj}</p>
                    </div>
                    <Badge variant={c.ativa ? 'success' : 'danger'} dot>
                      {c.ativa ? 'Ativa' : 'Desativada'}
                    </Badge>
                  </div>
                  <p className="text-sm text-ink-muted">{c.endereco}</p>
                  <div className="mt-auto grid grid-cols-3 gap-2 border-t border-black/5 pt-3 text-center">
                    <div>
                      <p className="text-lg font-extrabold text-ink">{c.usuarios}</p>
                      <p className="text-[10px] uppercase text-ink-subtle">Usuários</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-ink">
                        {c.dispositivosAtivos}/{c.dispositivos}
                      </p>
                      <p className="text-[10px] uppercase text-ink-subtle">Lixeiras</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-ink">{int(c.itens30d)}</p>
                      <p className="text-[10px] uppercase text-ink-subtle">Itens (30 d)</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}