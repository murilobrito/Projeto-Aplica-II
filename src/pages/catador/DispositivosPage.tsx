import { Cpu } from 'lucide-react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { PageHeading } from '../../components/PageHeading'
import { COLLECTORS } from '../../mocks/catador'

export function DispositivosPage() {
  return (
    <div>
      <PageHeading title="Meus Coletores" subtitle="Equipamentos IoT vinculados à sua cooperativa" />

      <ul className="flex flex-col gap-3">
        {COLLECTORS.map((c) => (
          <li key={c.id}>
            <Card>
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-ink-muted">
                  <Cpu size={22} />
                </span>
                <div className="flex-1">
                  <p className="font-bold text-ink">{c.name}</p>
                  <p className="text-xs text-ink-muted">Último sinal: {c.lastSignal}</p>
                </div>
                <Badge variant={c.online ? 'online' : 'offline'} dot>
                  {c.online ? 'ONLINE' : 'OFFLINE'}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-sm">
                <span className="text-ink-muted">Triagens realizadas hoje:</span>
                <span className="font-extrabold text-brand">{c.itemsToday} itens</span>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}