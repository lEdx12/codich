import { useState } from 'react'
import { Link }      from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'

const SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/
const CORREO_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validarCampos(form) {
  const errores = {}

  if (!form.nombres.trim())
    errores.nombres = 'Los nombres son obligatorios.'
  else if (!SOLO_LETRAS.test(form.nombres.trim()))
    errores.nombres = 'Los nombres no pueden contener números ni símbolos.'

  if (!form.apellidos.trim())
    errores.apellidos = 'Los apellidos son obligatorios.'
  else if (!SOLO_LETRAS.test(form.apellidos.trim()))
    errores.apellidos = 'Los apellidos no pueden contener números ni símbolos.'

  if (!CORREO_RE.test(form.correo))
    errores.correo = 'Ingresa un correo válido (ej: usuario@dominio.com).'

  if (!form.fechaNacimiento) {
    errores.fechaNacimiento = 'La fecha de nacimiento es obligatoria.'
  } else {
    const hoy     = new Date()
    const nacimiento = new Date(form.fechaNacimiento)
    const edad18  = new Date(nacimiento.getFullYear() + 18, nacimiento.getMonth(), nacimiento.getDate())
    if (nacimiento >= hoy)
      errores.fechaNacimiento = 'La fecha de nacimiento no puede ser futura.'
    else if (edad18 > hoy)
      errores.fechaNacimiento = 'Debes tener al menos 18 años para registrarte.'
  }

  if (form.password.length < 8)
    errores.password = 'La contraseña debe tener al menos 8 caracteres.'

  if (form.password !== form.confirmar)
    errores.confirmar = 'Las contraseñas no coinciden.'

  return errores
}

export default function RegisterForm() {
  const [form, setForm]         = useState({ nombres: '', apellidos: '', correo: '', fechaNacimiento: '', password: '', confirmar: '' })
  const [errores, setErrores]   = useState({})
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito]       = useState(false)
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
      await axiosInstance.post('/auth/register', {
        nombre:          form.nombres.trim(),
        apellidos:       form.apellidos.trim(),
        correo:          form.correo,
        fechaNacimiento: form.fechaNacimiento,
        password:        form.password,
      })
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

  const campos = [
    { name: 'nombres',          label: 'Nombres',                         type: 'text' },
    { name: 'apellidos',        label: 'Apellidos',                       type: 'text' },
    { name: 'correo',           label: 'Correo electrónico',              type: 'email' },
    { name: 'fechaNacimiento',  label: 'Fecha de nacimiento',             type: 'date', max: (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0] })() },
    { name: 'password',         label: 'Contraseña (mín. 8 caracteres)', type: 'password' },
    { name: 'confirmar',        label: 'Confirmar contraseña',            type: 'password' },
  ]

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="titulo-registro">
      <h2 id="titulo-registro" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Crear cuenta</h2>
      {errorApi && <p className="alert alert-error" role="alert">{errorApi}</p>}

      {campos.map(({ name, label, type, max }) => (
        <div key={name} className="form-group">
          <label htmlFor={name}>{label}</label>
          <input
            id={name} name={name} type={type} value={form[name]} onChange={handleChange}
            max={max}
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
