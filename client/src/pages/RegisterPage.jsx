import { Link } from 'react-router-dom'
import RegisterForm from '../components/auth/RegisterForm.jsx'

export default function RegisterPage() {
  return (
    <div className="auth-split">

      {/* Panel izquierdo — branding */}
      <div className="auth-split__left">
        <div className="auth-split__deco auth-split__deco--1" />
        <div className="auth-split__deco auth-split__deco--2" />
        <div className="auth-split__deco auth-split__deco--3" />
        <div className="auth-split__left-content">
          <Link to="/" className="auth-split__back">
            ← Volver al inicio
          </Link>
          <span className="auth-split__logo">CODICH</span>
          <h2 className="auth-split__tagline">
            Únete a la comunidad de diseñadores
          </h2>
          <p className="auth-split__sub">
            Crea tu cuenta gratis y accede a cientos de tutorías especializadas en diseño industrial.
          </p>
          <ul className="auth-split__features">
            <li>Catálogo con 180+ tutorías especializadas</li>
            <li>Planes mensual, anual y senior</li>
            <li>Certificados reconocidos por el colegio</li>
            <li>Comunidad de 2.400+ diseñadores activos</li>
          </ul>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="auth-split__right">
        <div className="auth-split__form-wrap">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', borderRadius: '10px', width: 44, height: 44, lineHeight: '44px', fontWeight: 900, fontSize: '1.1rem', marginBottom: '.75rem' }}>C</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Crear cuenta</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '.875rem', marginTop: '.25rem' }}>Regístrate como diseñador — es gratis</p>
          </div>
          <RegisterForm />
        </div>
      </div>

    </div>
  )
}
