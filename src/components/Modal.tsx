import type { ReactNode } from 'react'
import { X } from 'lucide-react'

// Painel que sobe de baixo (bottom sheet), comum em apps mobile
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-ink-muted">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}