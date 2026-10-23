import { BrowserRouter } from 'react-router'
import { House, ChartColumn, Smartphone, User } from 'lucide-react'
import { Badge } from './components/Badge'
import { BottomNav } from './components/BottomNav'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { Input } from './components/Input'
import { StatCard } from './components/StatCard'

const navItems = [
  { to: '/', label: 'Início', icon: House },
  { to: '/dashboard', label: 'Painel', icon: ChartColumn },
  { to: '/dispositivos', label: 'Lixeiras', icon: Smartphone },
  { to: '/perfil', label: 'Perfil', icon: User },
]

function App() {
  return (
    <BrowserRouter>
      <main className="mx-auto flex max-w-md flex-col gap-4 p-6 pb-24">
        <h1 className="text-3xl font-extrabold text-brand">EcoTriall</h1>
        <h3> isso é um teste dos componetes</h3>

        <div className="flex gap-2">
          <Badge variant="online">Online</Badge>
          <Badge variant="offline">Offline</Badge>
        </div>

        <StatCard label="Valor estimado" value="R$ 1.250,00" tone="brand" />
        <StatCard label="PET coletado" value="320 kg" />

        <Card>
          <p className="font-bold text-ink">Um Card qualquer</p>
          <p className="text-sm text-ink-muted">Conteúdo dentro da caixa branca.</p>
        </Card>

        <Input label="E-mail" name="email" type="email" placeholder="voce@email.com" />
        <Button fullWidth>Entrar</Button>
        <Button variant="secondary" fullWidth>
          Criar conta
        </Button>
      </main>

      <BottomNav items={navItems} />
    </BrowserRouter>
  )
}

export default App