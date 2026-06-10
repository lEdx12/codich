import { useState, useContext } from 'react'
import { useNavigate, Link }    from 'react-router-dom'
import axiosInstance            from '../../api/axiosInstance'
import { AuthContext }          from '../../context/AuthContext.jsx'

const RUTA_POR_ROL = {
  'diseñador':     '/dashboard/disenador',
  'instructor':    '/dashboard/instructor',
  'administrador': '/dashboard/admin',
}

const ROL_LABEL = { administrador: 'administrador', instructor: 'instructor', 'diseñador': 'diseñador' }

export default function LoginForm({ allowedRol }) {
  const { setUsuario } = useContext(AuthContext)
  const navigate       = useNavigate()

  const [form, setForm]         = useState({ correo: '', password: '' })
  const [error, setError]       = useState('')
  const [cargando, setCargando] = useState(false)
  const [bloqueado, setBloqueado] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.correo || !form.password) { setError('Completa todos los campos para continuar.'); return }
    setCargando(true)
    setError('')
    try {
      const { data } = await axiosInstance.post('/auth/login', form)
      if (allowedRol && data.usuario.rol !== allowedRol) {
        setError(`Este portal es exclusivo para ${ROL_LABEL[allowedRol]}s. Usa el acceso correcto para tu rol.`)
        setCargando(false)
        return
      }
      localStorage.setItem('token', data.token)
      setUsuario(data.usuario)
      navigate(RUTA_POR_ROL[data.usuario.rol] || '/')
    } catch (err) {
      const msg = err.response?.data?.mensaje || ''
      if (msg.includes('bloqueada')) {
        setBloqueado(true)
        setError('Tu cuenta está bloqueada temporalmente. Contacta al administrador.')
      } else {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <p className="alert alert-error" role="alert">{error}</p>}

      <div className="form-group">
        <label htmlFor="correo">Correo electrónico</label>
        <input id="correo" name="correo" type="email" value={form.correo}
          onChange={handleChange} autoComplete="email" required aria-invalid={!!error} />
      </div>

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <label htmlFor="password">Contraseña</label>
          <Link to="/recuperar-password" style={{ fontSize: '.8rem', color: 'var(--color-primary)' }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <input id="password" name="password" type="password" value={form.password}
          onChange={handleChange} autoComplete="current-password" required aria-invalid={!!error} />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={cargando || bloqueado}>
        {cargando ? 'Verificando...' : 'Iniciar sesión'}
      </button>

      {!allowedRol && (
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.875rem' }}>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      )}
    </form>
  )
}
