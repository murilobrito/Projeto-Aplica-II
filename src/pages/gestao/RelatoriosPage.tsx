import { useState, type FormEvent } from 'react'
import { Download, Plus } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { can } from '../../auth/permissions'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { REPORT_PERIODS, REPORT_TYPES, REPORTS, type Report } from '../../mocks/gestao'

export function RelatoriosPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>(REPORTS)
  const [creating, setCreating] = useState(false)
  const [typeId, setTypeId] = useState('fechamento')
  const [period, setPeriod] = useState(REPORT_PERIODS[1])
  const [notice, setNotice] = useState<string | null>(null)
  if (!user) return null

  // Relatório financeiro: só o gerente. O coordenador gera apenas os operacionais.
  const canFinancial = can(user.role, 'relatorios:financeiro')
  const types = REPORT_TYPES.filter((t) => !t.financial || canFinancial)
  const visible = reports.filter((r) => !r.financial || canFinancial)

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    const type = types.find((t) => t.id === typeId) ?? types[0]
    const report: Report = {
      id: Date.now(),
      title: type.label,
      format: type.format,
      period,
      status: type.financial ? 'email' : 'ready',
      financial: type.financial,
    }
    setReports((prev) => [report, ...prev])
    setCreating(false)
    setNotice(`Relatório "${type.label}" gerado.`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-brand p-5 text-white">
        <h1 className="text-xl font-extrabold">Gerador de Exportações</h1>
        <p className="mt-2 text-sm opacity-90">
          Crie novos relatórios customizados filtrando por período, tipo de dispositivo e categoria de
          cooperados.
        </p>
        <button
          onClick={() => setCreating(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-brand"
        >
          <Plus size={18} />
          {canFinancial ? 'Gerar Novo Relatório' : 'Gerar Relatório Operacional'}
        </button>
      </div>

      {notice && (
        <p role="status" className="rounded-xl bg-brand-light p-3 text-sm font-bold text-brand">
          {notice}
        </p>
      )}

      <h2 className="text-sm font-extrabold text-ink">Relatórios Disponíveis</h2>
      <ul className="flex flex-col gap-3">
        {visible.map((r) => (
          <li key={r.id}>
            <Card>
              <div className="flex items-center justify-between text-[11px]">
                <span className="rounded bg-black/5 px-2 py-0.5 font-bold text-ink-muted">{r.format}</span>
                <span className="font-bold text-brand">
                  {r.status === 'ready' ? 'Pronto para download' : 'Enviado por e-mail'}
                </span>
              </div>
              <p className="mt-2 font-extrabold text-ink">{r.title}</p>
              <p className="text-sm text-ink-muted">Período: {r.period}</p>
              {r.status === 'ready' && (
                <button
                  onClick={() => setNotice(`Download de "${r.title}" iniciado (simulado).`)}
                  className="mt-3 flex w-full items-center justify-center gap-2 border-t border-black/5 pt-3 text-sm font-bold text-brand"
                >
                  <Download size={16} />
                  Baixar Arquivo
                </button>
              )}
            </Card>
          </li>
        ))}
      </ul>

      {creating && (
        <Modal title="Gerar relatório" onClose={() => setCreating(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <Select label="Tipo de relatório" name="tipo" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} ({t.format})
                </option>
              ))}
            </Select>
            <Select label="Período" name="periodo" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {REPORT_PERIODS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
            <Button type="submit" fullWidth>
              Gerar
            </Button>
          </form>
        </Modal>
      )}
    </div>
  )
}