import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { useAuth }          from './hooks/useAuth.js'
import ProtectedRoute       from './routes/ProtectedRoute.jsx'

import LandingPage          from './pages/LandingPage.jsx'
import LoginPage            from './pages/LoginPage.jsx'
import LoginAdminPage       from './pages/LoginAdminPage.jsx'
import LoginInstructorPage  from './pages/LoginInstructorPage.jsx'
import RegisterPage         from './pages/RegisterPage.jsx'
import DashboardDisenador   from './pages/DashboardDisenador.jsx'
import DashboardInstructor  from './pages/DashboardInstructor.jsx'
import DashboardAdmin       from './pages/DashboardAdmin.jsx'

const ROL_LABEL = { 'diseñador': 'Diseñador', 'instructor': 'Instructor', 'administrador': 'Admin' }

function AppShell({ children }) {
  const { usuario, logout } = useAuth()
  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-dot" />
          CODICH
        </Link>
        <nav>
          <span className="user-chip">{usuario?.nombre}</span>
          <span className="role-badge">{ROL_LABEL[usuario?.rol] || usuario?.rol}</span>
          <button className="btn-logout" onClick={logout}>Cerrar sesión</button>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem', background: 'var(--color-bg)' }}>
      <span style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--color-border)' }}>404</span>
      <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text)' }}>Página no encontrada</h2>
      <Link to="/" className="btn btn-outline">← Volver al inicio</Link>
    </div>
  )
}

function NoAutorizado() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem', background: 'var(--color-bg)' }}>
      <span style={{ fontSize: '4rem', fontWeight: 900, color: '#fecaca' }}>403</span>
      <h2 style={{ color: 'var(--color-error)' }}>Acceso denegado</h2>
      <p style={{ color: 'var(--color-muted)' }}>No tienes permisos para acceder a esta página.</p>
      <Link to="/" className="btn btn-outline">← Volver al inicio</Link>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/"              element={<LandingPage />} />
      <Route path="/login"              element={<LoginPage />} />
      <Route path="/admin/login"        element={<LoginAdminPage />} />
      <Route path="/instructor/login"   element={<LoginInstructorPage />} />
      <Route path="/register"           element={<RegisterPage />} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />

      <Route path="/dashboard/disenador" element={
        <ProtectedRoute rolesPermitidos={['diseñador']}>
          <AppShell><DashboardDisenador /></AppShell>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/instructor" element={
        <ProtectedRoute rolesPermitidos={['instructor']}>
          <AppShell><DashboardInstructor /></AppShell>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/admin" element={
        <ProtectedRoute rolesPermitidos={['administrador']}>
          <AppShell><DashboardAdmin /></AppShell>
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
