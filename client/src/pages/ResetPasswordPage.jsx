import { useState }                from 'react'
import { Link, useSearchParams }   from 'react-router-dom'
import axiosInstance               from '../api/axiosInstance'

export default function ResetPasswordPage() {
  const [searchParams]              = useSearchParams()
  const token                       = searchParams.get('token') || ''

  const [form, setForm]             = useState({ password: '', confirmar: '' })
  const [errores, setErrores]       = useState({})
  const [enviando, setEnviando]     = useState(false)
  const [exito, setExito]           = useState(false)
  const [errorApi, setErrorApi]     = useState('')

  const validar = (f) => {
    const e = {}
    if (f.password.length < 8)    e.password  = 'La contraseña debe tener al menos 8 caracteres.'
    if (f.password !== f.confirmar) e.confirmar = 'Las contraseñas no coinciden.'
    return e
  }

  const handleChange = e => {
    const nuevoForm = { ...form, [e.target.name]: e.target.value }
    setForm(nuevoForm)
    const errs = validar(nuevoForm)
    setErrores(prev => ({ ...prev, [e.target.name]: errs[e.target.name] || '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validar(form)
    if (Object.values(errs).some(Boolean)) { setErrores(errs); return }
    setEnviando(true)
    setErrorApi('')
    try {
      await axiosInstance.post('/auth/resetear-password', { token, password: form.password })
      setExito(true)
    } catch (err) {
      setErrorApi(err.response?.data?.mensaje || 'Error al restablecer la contraseña. Intenta más tarde.')
    } finally {
      setEnviando(false)
    }
  }

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem', background: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-error)' }}>Enlace inválido. No se encontró el token de recuperación.</p>
        <Link to="/recuperar-password" className="btn btn-primary">Solicitar nuevo enlace</Link>
      </div>
    )
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
          <h2 className="auth-split__tagline">Crea una nueva contraseña</h2>
          <p className="auth-split__sub">
            Elige una contraseña segura de al menos 8 caracteres para proteger tu cuenta.
          </p>
        </div>
      </div>

      <div className="auth-split__right">
        <div className="auth-split__form-wrap">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', borderRadius: '10px', width: 44, height: 44, lineHeight: '44px', fontWeight: 900, fontSize: '1.1rem', marginBottom: '.75rem' }}>C</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Nueva contraseña</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '.875rem', marginTop: '.25rem' }}>
              Ingresa y confirma tu nueva contraseña
            </p>
          </div>

          {exito ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--color-success)', marginBottom: '1rem', fontWeight: 600 }}>
                ✅ Contraseña actualizada
              </p>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem', fontSize: '.9rem' }}>
                Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {errorApi && <p className="alert alert-error" role="alert">{errorApi}</p>}

              {[
                { name: 'password',  label: 'Nueva contraseña (mín. 8 caracteres)' },
                { name: 'confirmar', label: 'Confirmar nueva contraseña' },
              ].map(({ name, label }) => (
                <div key={name} className="form-group">
                  <label htmlFor={name}>{label}</label>
                  <input
                    id={name} name={name} type="password" value={form[name]}
                    onChange={handleChange} required
                    aria-describedby={errores[name] ? `${name}-error` : undefined}
                    aria-invalid={!!errores[name]}
                  />
                  {errores[name] && <span id={`${name}-error`} className="field-error" role="alert">{errores[name]}</span>}
                </div>
              ))}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={enviando}>
                {enviando ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  )
}
