import { Link } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm.jsx'

export default function LoginInstructorPage() {
  return (
    <div className="auth-split">

      {/* Panel izquierdo */}
      <div className="auth-split__left" style={{ background: 'linear-gradient(150deg, #1a3a5c 0%, #1e5a7e 55%, #2d7a9e 100%)' }}>
        <div className="auth-split__deco auth-split__deco--1" />
        <div className="auth-split__deco auth-split__deco--2" />
        <div className="auth-split__deco auth-split__deco--3" />
        <div className="auth-split__left-content">
          <Link to="/" className="auth-split__back">← Volver al inicio</Link>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', borderRadius: '20px', padding: '.3rem .9rem', marginBottom: '1.25rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'rgba(255,255,255,.85)', letterSpacing: '.5px', textTransform: 'uppercase' }}>Portal Instructores</span>
          </div>

          <span className="auth-split__logo">CODICH</span>
          <h2 className="auth-split__tagline">Gestiona tus tutorías y contenido</h2>
          <p className="auth-split__sub">
            Acceso para instructores certificados. Sube materiales, gestiona cupos y visualiza tus alumnos inscritos.
          </p>
          <ul className="auth-split__features">
            <li>Sube materiales PDF y videos MP4</li>
            <li>Edita títulos y descripciones de tus cursos</li>
            <li>Consulta la lista de alumnos inscritos</li>
            <li>Gestiona cupos y estado de tutorías</li>
          </ul>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="auth-split__right">
        <div className="auth-split__form-wrap">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ display: 'inline-block', background: '#1e5a7e', color: '#fff', borderRadius: '10px', width: 44, height: 44, lineHeight: '44px', fontWeight: 900, fontSize: '1.1rem', marginBottom: '.75rem' }}>I</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Acceso Instructor</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '.875rem', marginTop: '.25rem' }}>Ingresa tus credenciales de instructor</p>
          </div>
          <LoginForm allowedRol="instructor" />
          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.8rem', color: 'var(--color-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            ¿Eres administrador?{' '}
            <Link to="/admin/login" style={{ fontWeight: 600 }}>Ir al portal de administradores</Link>
          </p>
        </div>
      </div>

    </div>
  )
}
