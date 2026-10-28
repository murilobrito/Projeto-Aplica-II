import { MATERIALS, type MaterialId } from '../lib/materials'

export function MaterialIcon({ material, className = 'size-12' }: { material: MaterialId; className?: string }) {
  const { icon: Icon, text, soft } = MATERIALS[material]
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-2xl ${soft} ${text} ${className}`}>
      <Icon size={22} />
    </span>
  )
}