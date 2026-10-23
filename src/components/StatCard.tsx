type StatCardProps = {
  label: string
  value: string
  tone?: 'default' | 'brand'
}

export function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  const toneClasses =
    tone === 'brand' ? 'bg-brand-light' : 'bg-white ring-1 ring-black/5'

  return (
    <div className={`rounded-2xl p-4 shadow-sm ${toneClasses}`}>
      <p className="text-sm text-ink-subtle">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  )
}