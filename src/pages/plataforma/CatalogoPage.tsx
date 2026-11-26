import { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import { Card } from '../../components/Card'
import { EstadoCarga } from '../../components/EstadoCarga'
import { Toggle } from '../../components/Toggle'
import { apiAtualizarBasePrice, apiAtualizarItem, apiCategorias } from '../../lib/api'
import { MATERIALS } from '../../lib/materials'
import { useCarregar } from '../../lib/useCarregar'
import type { Category, Item } from '../../mocks/categorias'

// Campo numérico que só salva quando o usuário sai dele e o valor mudou
function CampoNumero({
  valor,
  onSalvar,
  rotulo,
  sufixo,
  passo = '0.01',
}: {
  valor: number
  onSalvar: (v: number) => void
  rotulo: string
  sufixo: string
  passo?: string
}) {
  const [texto, setTexto] = useState(String(valor))
  function sair() {
    const n = Number(texto.replace(',', '.'))
    if (!Number.isFinite(n) || n < 0) {
      setTexto(String(valor))
    } else if (n !== valor) {
      onSalvar(n)
    }
  }
  return (
    <label className="flex items-center gap-1.5">
      <input
        type="number"
        min="0"
        step={passo}
        inputMode="decimal"
        aria-label={rotulo}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={sair}
        className="w-20 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-right text-sm font-bold text-ink outline-none focus:ring-2 focus:ring-brand"
      />
      <span className="text-xs text-ink-muted">{sufixo}</span>
    </label>
  )
}

export function CatalogoPage() {
  const { dados, erro, recarregar } = useCarregar(apiCategorias)
  const [categorias, setCategorias] = useState<Category[] | null>(null)
  const [aberta, setAberta] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)

  // `dados` chega uma vez; a partir daí a tela edita a própria cópia
  const lista = categorias ?? dados

  function feito(texto: string) {
    setAviso({ ok: true, texto })
  }
  function falhou() {
    setAviso({ ok: false, texto: 'Não foi possível salvar' })
    setCategorias(null)
    recarregar()
  }

  function base(cat: Category, preco: number) {
    setCategorias((lista ?? []).map((c) => (c.id === cat.id ? { ...c, basePrice: preco } : c)))
    apiAtualizarBasePrice(cat.id, preco).then(() => feito('Preço-base atualizado')).catch(falhou)
  }

  function item(cat: Category, it: Item, patch: Partial<Pick<Item, 'price' | 'minConfidence' | 'active'>>) {
    setCategorias(
      (lista ?? []).map((c) =>
        c.id !== cat.id
          ? c
          : { ...c, groups: c.groups.map((g) => ({ ...g, items: g.items.map((i) => (i.id === it.id ? { ...i, ...patch } : i)) })) },
      ),
    )
    apiAtualizarItem(it.id, patch).then(() => feito('Item atualizado')).catch(falhou)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Catálogo de materiais</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Categorias e itens que o classificador de IA reconhece. Os valores abaixo são os <b>padrões da plataforma</b>:
          cada cooperativa pode definir os seus por cima.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-offline-bg p-3 text-sm font-medium text-offline">
        <Info size={18} className="mt-0.5 shrink-0" />
        Novas categorias e itens exigem retreino do modelo de IA, por isso ainda não são criados por aqui.
      </div>

      {aviso && (
        <p role="status" className={`text-sm font-bold ${aviso.ok ? 'text-brand' : 'text-danger'}`}>
          {aviso.texto}
        </p>
      )}

      {!lista ? (
        <EstadoCarga erro={erro} onTentar={recarregar} />
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((c) => {
            const m = MATERIALS[c.id]
            const aberto = aberta === c.id
            const total = c.groups.reduce((n, g) => n + g.items.length, 0)
            return (
              <li key={c.id}>
                <Card className="!p-0">
                  <div className="flex flex-wrap items-center gap-3 p-4">
                    <button
                      onClick={() => setAberta(aberto ? null : c.id)}
                      aria-expanded={aberto}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${m.soft} ${m.text}`}>
                        <m.icon size={20} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-extrabold text-ink">{m.label}</span>
                        <span className="block text-xs text-ink-muted">
                          {c.groups.length} subcategorias · {total} itens
                        </span>
                      </span>
                      <ChevronDown size={18} className={`ml-auto shrink-0 text-ink-subtle transition ${aberto ? 'rotate-180' : ''}`} />
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-ink-subtle">Preço-base</span>
                      <CampoNumero key={c.basePrice} valor={c.basePrice} rotulo={`Preço-base de ${m.label}`} sufixo="R$/kg" onSalvar={(v) => base(c, v)} />
                    </div>
                  </div>

                  {aberto && (
                    <div className="border-t border-black/5">
                      {c.groups.map((g) => (
                        <div key={g.id} className="border-b border-black/5 px-4 py-3 last:border-b-0">
                          <p className="mb-2 text-xs font-bold uppercase text-ink-subtle">{g.label}</p>
                          <ul className="flex flex-col gap-2">
                            {g.items.map((i) => (
                              <li key={i.id} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <span className="min-w-40 flex-1 text-sm font-bold text-ink">
                                  {i.label}
                                  {i.hard && <span className="ml-2 text-[10px] font-bold uppercase text-offline">difícil</span>}
                                </span>
                                <CampoNumero key={`p${i.price}`} valor={i.price} rotulo={`Preço de ${i.label}`} sufixo="R$/kg" onSalvar={(v) => item(c, i, { price: v })} />
                                <CampoNumero key={`c${i.minConfidence}`} valor={i.minConfidence} rotulo={`Confiança mínima de ${i.label}`} sufixo="% mín." passo="1" onSalvar={(v) => item(c, i, { minConfidence: Math.min(100, Math.round(v)) })} />
                                <Toggle checked={i.active} label={`Ativar ${i.label}`} onChange={(v) => item(c, i, { active: v })} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}