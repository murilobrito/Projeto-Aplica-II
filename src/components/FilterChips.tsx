type Option<T extends string> = { value: T; label: string }

type FilterChipsProps<T extends string> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

export function FilterChips<T extends string>({ options, value, onChange }: FilterChipsProps<T>) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
            o.value === value
              ? 'border-brand bg-brand text-white'
              : 'border-black/10 bg-white text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}