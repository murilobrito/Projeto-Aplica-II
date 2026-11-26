import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { apiCriarCooperativa, type NovaCoopResposta } from '../../lib/api'

export function NovaCooperativaPage() {
  const navigate = useNavigate()
  const [razao, setRazao] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [endereco, setEndereco] = useState('')
  const [gNome, setGNome] = useState('')
  const [gEmail, setGEmail] = useState('')
  const [gTelefone, setGTelefone] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [criada, setCriada] = useState<NovaCoopResposta | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      setCriada(
        await apiCriarCooperativa({
          razao,
          cnpj,
          endereco,
          gerente: { name: gNome, email: gEmail || undefined, phone: gTelefone },
        }),
      )
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível criar a cooperativa')
    } finally {
      setEnviando(false)
    }
  }

  if (criada) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <Card className="flex flex-col items-center gap-2 py-6 text-center">
          <CheckCircle2 size={40} className="text-brand" />
          <h1 className="text-xl font-extrabold text-ink">Cooperativa criada!</h1>
          <p className="text-sm text-ink-muted">{criada.razao}</p>
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="font-extrabold text-ink">Acesso do primeiro gerente</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-ink-muted">Nome</dt>
            <dd className="font-bold text-ink">{criada.gerente.name}</dd>
            <dt className="text-ink-muted">ID de usuário</dt>
            <dd className="font-bold text-ink">{criada.gerente.id}</dd>
            {criada.gerente.email && (
              <>
                <dt className="text-ink-muted">E-mail</dt>
                <dd className="font-bold text-ink">{criada.gerente.email}</dd>
              </>
            )}
            <dt className="text-ink-muted">Senha inicial</dt>
            <dd className="font-bold text-ink">{criada.senhaInicial}</dd>
          </dl>
          <p className="rounded-xl bg-offline-bg p-3 text-xs font-medium text-offline">
            Passe estes dados ao gerente agora: ainda não existe recuperação de senha, e esta tela não aparece de novo.
          </p>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate(`/plataforma/cooperativas/${criada.id}`)}>Ver cooperativa</Button>
          <Button variant="secondary" onClick={() => navigate('/plataforma/cooperativas')}>
            Voltar à lista
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <Link to="/plataforma/cooperativas" className="flex items-center gap-1 text-sm font-bold text-brand">
        <ArrowLeft size={16} />
        Cooperativas
      </Link>
      <h1 className="text-2xl font-extrabold text-ink">Nova cooperativa</h1>

      <form onSubmit={enviar} className="flex flex-col gap-4">
        <h2 className="font-extrabold text-ink">Dados da cooperativa</h2>
        <Input label="Razão social" name="razao" value={razao} onChange={(e) => setRazao(e.target.value)} required />
        <Input label="CNPJ" name="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" required />
        <Input label="Endereço da sede" name="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />

        <h2 className="mt-2 font-extrabold text-ink">Primeiro gerente</h2>
        <p className="-mt-2 text-xs text-ink-muted">
          Toda cooperativa nasce com um gerente. É ele quem cadastra o restante da equipe.
        </p>
        <Input label="Nome completo" name="gerente-nome" value={gNome} onChange={(e) => setGNome(e.target.value)} required />
        <Input label="E-mail (opcional)" name="gerente-email" type="email" value={gEmail} onChange={(e) => setGEmail(e.target.value)} />
        <Input label="Telefone" name="gerente-telefone" type="tel" value={gTelefone} onChange={(e) => setGTelefone(e.target.value)} required />

        {erro && (
          <p role="alert" className="text-sm font-bold text-danger">
            {erro}
          </p>
        )}
        <Button type="submit" fullWidth disabled={enviando}>
          {enviando ? 'Criando…' : 'Criar cooperativa'}
        </Button>
      </form>
    </div>
  )
}