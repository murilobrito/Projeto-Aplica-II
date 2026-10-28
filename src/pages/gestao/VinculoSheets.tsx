import { useState } from 'react'
import { Check } from 'lucide-react'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { useGestao } from '../../gestao/GestaoContext'
import { deviceShort, type CoopUser, type Device } from '../../mocks/gestao'

// Linha de opção (estilo "radio") usada nas duas telas de vínculo
function Option({
  selected,
  disabled,
  title,
  hint,
  onClick,
  avatar,
}: {
  selected: boolean
  disabled?: boolean
  title: string
  hint?: string
  onClick: () => void
  avatar?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-50 ${
        selected ? 'border-brand bg-brand-light' : 'border-black/10 bg-white'
      }`}
    >
      {avatar && <Avatar name={avatar} className="size-9 text-xs" />}
      <span className="flex-1">
        <span className="block font-bold text-ink">{title}</span>
        {hint && <span className="block text-xs text-ink-muted">{hint}</span>}
      </span>
      {selected && <Check size={18} className="text-brand" />}
    </button>
  )
}

// A partir de uma LIXEIRA: escolher qual catador opera nela
export function AssignCatadorSheet({ device, onClose }: { device: Device; onClose: () => void }) {
  const { users, devices, assignDevice } = useGestao()
  const [selected, setSelected] = useState<string | null>(device.catadorId)
  const catadores = users.filter((u) => u.role === 'catador' && u.active)

  function confirm() {
    assignDevice(device.id, selected)
    onClose()
  }

  return (
    <Modal title={`Vincular catador · ${deviceShort(device)}`} onClose={onClose}>
      <div className="flex flex-col gap-2">
        <Option selected={selected === null} title="Sem catador" hint="Lixeira fica sem operador" onClick={() => setSelected(null)} />
        {catadores.map((c) => {
          const other = devices.find((d) => d.catadorId === c.id && d.id !== device.id)
          return (
            <Option
              key={c.id}
              avatar={c.name}
              selected={selected === c.id}
              title={c.name}
              hint={other ? `Hoje na ${deviceShort(other)} (será movido)` : `ID ${c.id}`}
              onClick={() => setSelected(c.id)}
            />
          )
        })}
      </div>
      <Button fullWidth className="mt-4" onClick={confirm}>
        Confirmar vínculo
      </Button>
    </Modal>
  )
}

// A partir de um CATADOR: escolher em qual lixeira ele trabalha
export function AssignDeviceSheet({ catador, onClose }: { catador: CoopUser; onClose: () => void }) {
  const { users, devices, assignDevice } = useGestao()
  const current = devices.find((d) => d.catadorId === catador.id) ?? null
  const [selected, setSelected] = useState<number | null>(current?.id ?? null)

  function confirm() {
    if (selected === null) {
      if (current) assignDevice(current.id, null)
    } else {
      assignDevice(selected, catador.id)
    }
    onClose()
  }

  return (
    <Modal title={`Vincular dispositivo · ${catador.name.split(' ')[0]}`} onClose={onClose}>
      <div className="flex flex-col gap-2">
        <Option selected={selected === null} title="Nenhum dispositivo" onClick={() => setSelected(null)} />
        {devices.map((d) => {
          const owner = d.catadorId && d.catadorId !== catador.id ? users.find((u) => u.id === d.catadorId) : null
          return (
            <Option
              key={d.id}
              selected={selected === d.id}
              disabled={!d.active}
              title={d.name}
              hint={!d.active ? 'Dispositivo inativo' : owner ? `Hoje com ${owner.name} (será trocado)` : d.location}
              onClick={() => setSelected(d.id)}
            />
          )
        })}
      </div>
      <Button fullWidth className="mt-4" onClick={confirm}>
        Confirmar vínculo
      </Button>
    </Modal>
  )
}