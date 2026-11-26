import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Power } from 'lucide-react'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EstadoCarga } from '../../components/EstadoCarga'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { apiAtualizarCooperativaPlataforma, apiCooperativaDetalhe } from '../../lib/api'
import { int } from '../../lib/format'
import { useCarregar } from '../../lib/useCarregar'

export function CooperativaDetalhePage() {
  const { id } = useParams()
  const coopId = Number(id)
  const { dados, erro, recarregar } = useCarregar(() => apiCooperativaDetalhe(coopId))

  const [razao, setRazao] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [endereco, setEndereco] = useState('')
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    if (dados) {
      setRazao(dados.razao)
      setCnpj(dados.cnpj)
      setEndereco(dados.endereco)
    }
  }, [dados])

  async function salvar(e: FormEvent) {
    e.preventDefault()
    try {
      await apiAtualizarCooperativaPlataforma(coopId, { razao, cnpj, endereco })
      setAviso({ ok: true, texto: 'Dados salvos' })
      recarregar()
    } catch (err) {
      setAviso({ ok: false, texto: err instanceof Error ? err.message : 'Não foi possível salvar' })
    }
  }

  async function alternarAtiva() {
    if (!dados) return
    try {
      await apiAtualizarCooperativaPlataforma(coopId, { ativa: !dados.ativa })
      setAviso({ ok: true, texto: dados.ativa ? 'Cooperativa desativada' : 'Cooperativa reativada' })
      recarregar()
    } catch (err) {
      setAviso({ ok: false, texto: err instanceof Error ? err.message : 'Não foi possível alterar' })
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/plataforma/cooperativas" className="flex items-center gap-1 text-sm font-bold text-brand">
        <ArrowLeft size={16} />
        Cooperativas
      </Link>

      {!dados ? (
        <EstadoCarga erro={erro} onTentar={recarregar} />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-ink">{dados.razao}</h1>
              <p className="text-sm text-ink-muted">CNPJ {dados.cnpj}</p>
            </div>
            <Badge variant={dados.ativa ? 'success' : 'danger'} dot>
              {dados.ativa ? 'Ativa' : 'Desativada'}
            </Badge>
          </div>

          {aviso && (
            <p role="status" className={`text-sm font-bold ${aviso.ok ? 'text-brand' : 'text-danger'}`}>
              {aviso.texto}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ['Usuários ativos', int(dados.usuarios)],
              ['Catadores', int(dados.catadores)],
              ['Lixeiras online', `${dados.dispositivosAtivos} / ${dados.dispositivos}`],
              ['Itens em 30 dias', int(dados.itens30d)],
            ].map(([rotulo, valor]) => (
              <Card key={rotulo}>
                <p className="text-[11px] font-medium uppercase text-ink-muted">{rotulo}</p>
                <p className="mt-1 text-xl font-extrabold text-ink">{valor}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={salvar} className="flex flex-col gap-4">
              <h2 className="font-extrabold text-ink">Dados da cooperativa</h2>
              <Input label="Razão social" name="razao" value={razao} onChange={(e) => setRazao(e.target.value)} required />
              <Input label="CNPJ" name="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
              <Input label="Endereço da sede" name="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
              <Button type="submit" fullWidth>
                Salvar alterações
              </Button>
            </form>

            <div className="flex flex-col gap-4">
              <section className="flex flex-col gap-3">
                <h2 className="font-extrabold text-ink">Gerentes</h2>
                {dados.gerentes.length === 0 ? (
                  <Card className="text-sm text-ink-muted">Nenhum gerente cadastrado.</Card>
                ) : (
                  <Card className="!p-0">
                    <ul className="divide-y divide-black/5">
                      {dados.gerentes.map((g) => (
                        <li key={g.id} className="flex items-center gap-3 px-4 py-3">
                          <Avatar name={g.name} className="size-9 text-xs" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-ink">{g.name}</span>
                            <span className="block truncate text-xs text-ink-muted">
                              {g.id}
                              {g.email ? ` · ${g.email}` : ''}
                            </span>
                          </span>
                          {!g.active && <Badge variant="danger">Inativo</Badge>}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </section>

              <section className="flex flex-col gap-2">
                <h2 className="font-extrabold text-ink">{dados.ativa ? 'Desativar cooperativa' : 'Reativar cooperativa'}</h2>
                <p className="text-sm text-ink-muted">
                  {dados.ativa
                    ? 'Enquanto estiver desativada, ninguém desta cooperativa consegue entrar. Os dados são mantidos.'
                    : 'Reativando, a equipe volta a conseguir entrar normalmente.'}
                </p>
                <button
                  onClick={() => (dados.ativa ? setConfirmando(true) : alternarAtiva())}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${
                    dados.ativa ? 'bg-danger-soft text-danger' : 'bg-brand-light text-brand'
                  }`}
                >
                  <Power size={16} />
                  {dados.ativa ? 'Desativar' : 'Reativar'}
                </button>
              </section>
            </div>
          </div>

          {confirmando && (
            <Modal title="Desativar cooperativa?" onClose={() => setConfirmando(false)}>
              <p className="text-sm text-ink-muted">
                {dados.usuarios} usuário(s) de <b>{dados.razao}</b> perdem o acesso até a cooperativa ser reativada.
              </p>
              <div className="mt-5 flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => setConfirmando(false)}>
                  Cancelar
                </Button>
                <button onClick={alternarAtiva} className="w-full rounded-xl bg-danger px-6 py-3 text-sm font-bold text-white">
                  Desativar
                </button>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  )
}