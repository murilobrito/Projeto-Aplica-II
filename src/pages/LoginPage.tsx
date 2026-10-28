import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Eye, EyeOff, Leaf } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { homeOf } from '../auth/roles'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { APP_NAME } from '../lib/config'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Já está logado? Vai direto para a área dele.
  if (user) return <Navigate to={homeOf(user.role)} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const logged = await login(identifier, password)
      navigate(homeOf(logged.role), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand text-white">
          <Leaf size={32} />
        </span>
        <h1 className="text-3xl font-extrabold text-ink">{APP_NAME}</h1>
        <p className="text-ink-muted">Acesse sua conta para continuar</p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="E-mail ou ID de usuário"
            name="identifier"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            placeholder="voce@ecotriall.com ou RV-1024"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <div className="relative">
            <Input
              label="Senha"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute bottom-3 right-3 text-ink-muted"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="text-sm font-medium text-offline">{error}</p>}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Card>

      <button type="button" className="text-sm font-bold text-brand underline">
        Esqueci minha senha
      </button>

      {/* Provisório: contas de teste enquanto não existe back (senha 123456) */}
      <p className="rounded-xl bg-offline-bg p-3 text-xs text-offline">
        Contas de teste (senha 123456): admin@ecotriall.com (equipe EcoTriall),
        gerente@ecotriall.com, coordenador@ecotriall.com, catador@ecotriall.com, ou só o ID
        RV-1025 (catador sem e-mail).
      </p>
    </main>
  )
}