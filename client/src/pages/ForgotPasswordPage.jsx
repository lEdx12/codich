import { useState }  from 'react'
import { Link }       from 'react-router-dom'
import axiosInstance  from '../api/axiosInstance'

const CORREO_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
  const [correo, setCorreo]   = useState('')
  const [error, setError]     = useState('')
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito]     = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!CORREO_RE.test(correo)) { setError('Ingresa un correo válido.'); return }
    setEnviando(true)
    setError('')
    try {
      await axiosInstance.post('/auth/recuperar-password', { correo })
      setExito(true)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo procesar la solicitud. Intenta más tarde.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="auth-split">

      <div className="auth-split__left">
        <div className="auth-split__deco auth-split__deco--1" />
        <div className="auth-split__deco auth-split__deco--2" />
        <div className="auth-split__deco auth-split__deco--3" />
        <div className="auth-split__left-content">
          <Link to="/login" className="auth-split__back">← Volver al inicio de sesión</Link>
          <span className="auth-split__logo">CODICH</span>
          <h2 className="auth-split__tagline">Recupera tu acceso</h2>
          <p className="auth-split__sub">
            Ingresa el correo de tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>
      </div>

      <div className="auth-split__right">
        <div className="auth-split__form-wrap">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', borderRadius: '10px', width: 44, height: 44, lineHeight: '44px', fontWeight: 900, fontSize: '1.1rem', marginBottom: '.75rem' }}>C</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>¿Olvidaste tu contraseña?</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '.875rem', marginTop: '.25rem' }}>
              Te enviaremos un enlace de recuperación
            </p>
          </div>

          {exito ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--color-success)', marginBottom: '1rem', fontWeight: 600 }}>
                ✅ Revisa tu correo
              </p>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem', fontSize: '.9rem' }}>
                Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && <p className="alert alert-error" role="alert">{error}</p>}

              <div className="form-group">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                  id="correo" type="email" value={correo} autoComplete="email" required
                  onChange={e => { setCorreo(e.target.value); setError('') }}
                  aria-invalid={!!error}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>

              <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.875rem' }}>
                ¿Recordaste tu contraseña? <Link to="/login">Inicia sesión</Link>
              </p>
            </form>
          )}
        </div>
      </div>

    </div>
  )
}
