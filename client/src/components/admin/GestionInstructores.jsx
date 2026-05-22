import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'

export default function GestionInstructores() {
  const [instructores, setInstructores] = useState([])
  const [cargando, setCargando]         = useState(true)
  const [error, setError]               = useState('')
  const [modalEliminar, setModalEliminar] = useState(null)
  const [formulario, setFormulario]     = useState(null)

  useEffect(() => { cargarInstructores() }, [])

  const cargarInstructores = async () => {
    setCargando(true)
    try {
      const { data } = await axiosInstance.get('/instructores')
      setInstructores(data)
    } catch {
      setError('No se pudieron cargar los instructores.')
    } finally {
      setCargando(false)
    }
  }

  const handleGuardar = async (datos) => {
    try {
      if (datos._id) {
        await axiosInstance.put(`/instructores/${datos._id}`, datos)
      } else {
        await axiosInstance.post('/instructores', datos)
      }
      setFormulario(null)
      await cargarInstructores()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el instructor.')
    }
  }

  const handleConfirmarSuspender = async () => {
    if (!modalEliminar) return
    try {
      await axiosInstance.delete(`/instructores/${modalEliminar._id}`)
      setModalEliminar(null)
      await cargarInstructores()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al suspender el instructor.')
    }
  }

  const badgeEstado = (e) => {
    if (e === 'activo')     return <span className="badge badge-green">activo</span>
    if (e === 'suspendido') return <span className="badge badge-red">suspendido</span>
    return <span className="badge badge-yellow">{e}</span>
  }

  if (cargando) return <p aria-live="polite">Cargando instructores...</p>

  return (
    <section className="card" aria-labelledby="titulo-instructores">
      <h2 id="titulo-instructores" style={{ marginBottom: '1rem' }}>Gestión de instructores</h2>
      {error && <p className="alert alert-error" role="alert">{error}</p>}

      <div className="btn-row" style={{ marginBottom: '1rem' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setFormulario({ nombre: '', correo: '', especialidad: '', password: '', estado: 'activo' })}
        >
          + Nuevo instructor
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th><th>Correo</th><th>Especialidad</th>
              <th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {instructores.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>Sin instructores registrados.</td></tr>
            )}
            {instructores.map(inst => (
              <tr key={inst._id}>
                <td>{inst.nombre}</td>
                <td>{inst.correo}</td>
                <td>{inst.especialidad || '—'}</td>
                <td>{badgeEstado(inst.estado)}</td>
                <td>
                  <div className="btn-row" style={{ margin: 0 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setFormulario(inst)}>Editar</button>
                    <button className="btn btn-danger btn-sm"  onClick={() => setModalEliminar(inst)}>Suspender</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formulario && (
        <div className="modal-overlay">
          <FormularioInstructor datos={formulario} onGuardar={handleGuardar} onCancelar={() => setFormulario(null)} />
        </div>
      )}

      {modalEliminar && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
          <div className="modal">
            <h3 id="modal-titulo">Confirmar suspensión</h3>
            <p style={{ margin: '1rem 0' }}>
              ¿Deseas suspender la cuenta de <strong>{modalEliminar.nombre}</strong>?
              Esta acción puede revertirse.
            </p>
            <div className="btn-row">
              <button className="btn btn-danger"   onClick={handleConfirmarSuspender}>Confirmar</button>
              <button className="btn btn-outline"  onClick={() => setModalEliminar(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function FormularioInstructor({ datos, onGuardar, onCancelar }) {
  const [form, setForm] = useState(datos)
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="modal" aria-labelledby="form-titulo">
      <h3 id="form-titulo">{form._id ? 'Editar instructor' : 'Nuevo instructor'}</h3>
      <form onSubmit={e => { e.preventDefault(); onGuardar(form) }} style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Correo</label>
          <input name="correo" type="email" value={form.correo} onChange={handleChange} required disabled={!!form._id} />
        </div>
        <div className="form-group">
          <label>Especialidad</label>
          <input name="especialidad" value={form.especialidad || ''} onChange={handleChange} />
        </div>
        {!form._id && (
          <div className="form-group">
            <label>Contraseña inicial</label>
            <input name="password" type="password" value={form.password || ''} onChange={handleChange} required minLength={8} />
          </div>
        )}
        <div className="form-group">
          <label>Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </div>
        <div className="btn-row">
          <button type="submit" className="btn btn-primary">Guardar</button>
          <button type="button" className="btn btn-outline" onClick={onCancelar}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
