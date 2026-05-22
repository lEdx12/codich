import { Link } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm.jsx'

export default function LoginAdminPage() {
  return (
    <div className="auth-split">

      {/* Panel izquierdo */}
      <div className="auth-split__left" style={{ background: 'linear-gradient(150deg, #0a1628 0%, #0f2540 50%, #1a3a5c 100%)' }}>
        <div className="auth-split__deco auth-split__deco--1" />
        <div className="auth-split__deco auth-split__deco--2" />
        <div className="auth-split__deco auth-split__deco--3" />
        <div className="auth-split__left-content">
          <Link to="/" className="auth-split__back">← Volver al inicio</Link>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(232,86,42,.2)', border: '1px solid rgba(232,86,42,.4)', borderRadius: '20px', padding: '.3rem .9rem', marginBottom: '1.25rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e8562a" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#e8562a', letterSpacing: '.5px', textTransform: 'uppercase' }}>Portal Administradores</span>
          </div>

          <span className="auth-split__logo">CODICH</span>
          <h2 className="auth-split__tagline">Panel de administración de la plataforma</h2>
          <p className="auth-split__sub">
            Acceso exclusivo para administradores. Gestiona instructores, genera informes y controla la plataforma CODICH.
          </p>
          <ul className="auth-split__features">
            <li>Gestión completa de instructores</li>
            <li>Generación de informes PDF y CSV</li>
            <li>Control de membresías activas</li>
            <li>Acceso a todos los datos de la plataforma</li>
          </ul>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="auth-split__right">
        <div className="auth-split__form-wrap">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ display: 'inline-block', background: 'var(--color-primary-dark)', color: '#fff', borderRadius: '10px', width: 44, height: 44, lineHeight: '44px', fontWeight: 900, fontSize: '1.1rem', marginBottom: '.75rem' }}>A</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Acceso Administrador</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '.875rem', marginTop: '.25rem' }}>Ingresa tus credenciales de administrador</p>
          </div>
          <LoginForm allowedRol="administrador" />
          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.8rem', color: 'var(--color-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            ¿Eres instructor?{' '}
            <Link to="/instructor/login" style={{ fontWeight: 600 }}>Ir al portal de instructores</Link>
          </p>
        </div>
      </div>

    </div>
  )
}
