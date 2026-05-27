import { useContext }   from 'react'
import { Navigate }     from 'react-router-dom'
import { AuthContext }  from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, rolesPermitidos = [], loginPath = '/login' }) {
  const { usuario } = useContext(AuthContext)

  if (!usuario) return <Navigate to={loginPath} replace />
  if (rolesPermitidos.length && !rolesPermitidos.includes(usuario.rol))
    return <Navigate to="/no-autorizado" replace />

  return children
}
