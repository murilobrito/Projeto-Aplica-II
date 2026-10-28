import {
  Apple,
  Package,
  PackageSearch,
  Recycle,
  ShoppingBasket,
  Wine,
  type LucideIcon,
} from 'lucide-react'

export type MaterialId = 'plastico' | 'papel' | 'metal' | 'vidro' | 'organico' | 'outros'

export type Material = {
  id: MaterialId
  label: string
  icon: LucideIcon
  // Classes escritas por inteiro: o Tailwind só gera o que aparece completo no código
  text: string // cor do ícone
  soft: string // fundo suave
}

export const MATERIALS: Record<MaterialId, Material> = {
  plastico: { id: 'plastico', label: 'Plástico', icon: Recycle, text: 'text-plastico', soft: 'bg-plastico-soft' },
  papel: { id: 'papel', label: 'Papel', icon: Package, text: 'text-papel', soft: 'bg-papel-soft' },
  metal: { id: 'metal', label: 'Metal', icon: ShoppingBasket, text: 'text-metal', soft: 'bg-metal-soft' },
  vidro: { id: 'vidro', label: 'Vidro', icon: Wine, text: 'text-vidro', soft: 'bg-vidro-soft' },
  organico: { id: 'organico', label: 'Orgânico', icon: Apple, text: 'text-organico', soft: 'bg-organico-soft' },
  outros: { id: 'outros', label: 'Outros', icon: PackageSearch, text: 'text-outros', soft: 'bg-outros-soft' },
}