function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-extrabold text-brand">EcoTriall</h1>
      <p className="text-ink-muted">Texto secundário de teste</p>

      <div className="rounded-2xl bg-brand-light p-4 text-ink">
        <p className="text-sm text-ink-subtle">Valor estimado</p>
        <p className="text-2xl font-bold">R$ 1.250,00</p>
      </div>

      <span className="rounded-full bg-offline-bg px-3 py-1 text-sm font-medium text-offline">
        Offline
      </span>

      <button className="rounded-xl bg-brand px-8 py-3 text-sm font-bold text-white">
        Entrar
      </button>
    </div>
  )
}

export default App