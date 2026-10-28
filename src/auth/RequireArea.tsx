import { Navigate, Outlet } from 'react-router'
import { useAuth } from './AuthContext'
import { areaOf, homeOf, type Area } from './roles'

/** Só deixa passar quem está logado E pertence à área (admin ou catador). */
export function RequireArea({ area }: { area: Area }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (areaOf(user.role) !== area) return <Navigate to={homeOf(user.role)} replace />

  return <Outlet />
}