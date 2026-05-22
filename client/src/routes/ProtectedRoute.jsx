import { useContext }   from 'react'
import { Navigate }     from 'react-router-dom'
import { AuthContext }  from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, rolesPermitidos = [] }) {
  const { usuario } = useContext(AuthContext)

  if (!usuario) return <Navigate to="/login" replace />
  if (rolesPermitidos.length && !rolesPermitidos.includes(usuario.rol))
    return <Navigate to="/no-autorizado" replace />

  return children
}
