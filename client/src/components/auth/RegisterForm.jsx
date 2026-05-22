import { useState } from 'react'
import { Link }      from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'

function validarCampos(form) {
  const errores = {}
  if (!form.nombre.trim())
    errores.nombre = 'El nombre es obligatorio.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
    errores.correo = 'Ingresa un correo válido (ej: usuario@dominio.com).'
  if (form.password.length < 8)
    errores.password = 'La contraseña debe tener al menos 8 caracteres.'
  if (form.password !== form.confirmar)
    errores.confirmar = 'Las contraseñas no coinciden.'
  return errores
}

export default function RegisterForm() {
  const [form, setForm]       = useState({ nombre: '', correo: '', password: '', confirmar: '' })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito]     = useState(false)
  const [errorApi, setErrorApi] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    const nuevoForm = { ...form, [name]: value }
    setForm(nuevoForm)
    const nuevosErrores = validarCampos(nuevoForm)
    setErrores(prev => ({ ...prev, [name]: nuevosErrores[name] || '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const erroresFinal = validarCampos(form)
    if (Object.values(erroresFinal).some(Boolean)) { setErrores(erroresFinal); return }
    setEnviando(true)
    setErrorApi('')
    try {
      await axiosInstance.post('/auth/register', { nombre: form.nombre, correo: form.correo, password: form.password })
      setExito(true)
    } catch (err) {
      const msg = err.response?.data?.mensaje
      if (msg?.includes('correo')) {
        setErrores(prev => ({ ...prev, correo: 'Este correo ya está registrado.' }))
      } else {
        setErrorApi(msg || 'Error al registrarse. Intenta más tarde.')
      }
    } finally {
      setEnviando(false)
    }
  }

  if (exito) {
    return (
      <div className="auth-card" role="alertdialog" aria-modal="true" aria-labelledby="registro-ok" style={{ textAlign: 'center' }}>
        <h2 id="registro-ok" style={{ color: 'var(--color-success)', marginBottom: '1rem' }}>✅ Registro exitoso</h2>
        <p style={{ marginBottom: '1.5rem' }}>Tu cuenta fue creada. Ya puedes iniciar sesión.</p>
        <Link to="/login" className="btn btn-primary">Ir al inicio de sesión</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="titulo-registro">
      <h2 id="titulo-registro" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Crear cuenta</h2>
      {errorApi && <p className="alert alert-error" role="alert">{errorApi}</p>}

      {[
        { name: 'nombre',    label: 'Nombre completo',             type: 'text' },
        { name: 'correo',    label: 'Correo electrónico',          type: 'email' },
        { name: 'password',  label: 'Contraseña (mín. 8 caracteres)', type: 'password' },
        { name: 'confirmar', label: 'Confirmar contraseña',        type: 'password' },
      ].map(({ name, label, type }) => (
        <div key={name} className="form-group">
          <label htmlFor={name}>{label}</label>
          <input
            id={name} name={name} type={type} value={form[name]} onChange={handleChange}
            aria-describedby={errores[name] ? `${name}-error` : undefined}
            aria-invalid={!!errores[name]} required
          />
          {errores[name] && <span id={`${name}-error`} className="field-error" role="alert">{errores[name]}</span>}
        </div>
      ))}

      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '.5rem' }} disabled={enviando}>
        {enviando ? 'Registrando...' : 'Crear cuenta'}
      </button>

      <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.875rem' }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </form>
  )
}
