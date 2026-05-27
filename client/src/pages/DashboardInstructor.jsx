import { useState, useEffect } from 'react'
import { useAuth }              from '../hooks/useAuth.js'
import GestionContenido         from '../components/tutorias/GestionContenido.jsx'
import axiosInstance            from '../api/axiosInstance.js'

const CATEGORIAS = ['Diseño Industrial', 'Ergonomía', 'Materiales', 'Fabricación', 'CAD/CAM', 'Diseño Sustentable', 'Historia del Diseño', 'Otra']

const ESTADO_BADGE = {
  activa:   'badge-green',
  inactiva: 'badge-red',
  borrador: 'badge-yellow',
}

function FormularioNuevaTutoria({ onCreada, onCancelar }) {
  const [form, setForm]     = useState({ titulo: '', descripcion: '', precio: '', cuposTotal: '', categoria: '' })
  const [error, setError]   = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      const { data } = await axiosInstance.post('/tutorias', form)
      onCreada(data.tutoria)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear la tutoría.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1.25rem' }}>Nueva tutoría</h3>
      {error && <p className="alert alert-error" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        <div className="form-group">
          <label>Título <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <input name="titulo" value={form.titulo} onChange={handleChange} required maxLength={200} placeholder="Ej: Introducción al diseño ergonómico" />
        </div>
        <div className="form-group">
          <label>Descripción <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={3} maxLength={500} placeholder="Describe de qué trata la tutoría..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Precio (CLP) <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input name="precio" type="number" min="0" value={form.precio} onChange={handleChange} required placeholder="25000" />
          </div>
          <div className="form-group">
            <label>Cupos totales <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input name="cuposTotal" type="number" min="1" value={form.cuposTotal} onChange={handleChange} required placeholder="20" />
          </div>
        </div>
        <div className="form-group">
          <label>Categoría <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <select name="categoria" value={form.categoria} onChange={handleChange} required>
            <option value="">-- Seleccionar --</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <p style={{ fontSize: '.8rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
          La tutoría se crea en estado <strong>borrador</strong>. Podrás activarla desde el panel de gestión.
        </p>
        <div className="btn-row">
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Creando...' : 'Crear tutoría'}
          </button>
          <button type="button" className="btn btn-outline" onClick={onCancelar}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}

export default function DashboardInstructor() {
  const { usuario }                             = useAuth()
  const [tutorias, setTutorias]                 = useState([])
  const [cargando, setCargando]                 = useState(true)
  const [tutoriaSeleccionada, setTutoriaSeleccionada] = useState(null)
  const [tab, setTab]                           = useState('mis-tutorias')
  const [errorLista, setErrorLista]             = useState('')

  const cargarTutorias = () => {
    if (!usuario?.id) return
    setCargando(true)
    setErrorLista('')
    axiosInstance.get('/tutorias', { params: { instructor: usuario.id } })
      .then(({ data }) => setTutorias(data.tutorias || []))
      .catch(() => setErrorLista('No se pudieron cargar las tutorías.'))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargarTutorias() }, [usuario?.id])

  const handleTutoriaCreada = (nuevaTutoria) => {
    setTutorias(prev => [nuevaTutoria, ...prev])
    setTab('mis-tutorias')
  }

  if (tutoriaSeleccionada) {
    return (
      <div>
        <button className="btn btn-outline btn-sm" style={{ marginBottom: '1rem' }} onClick={() => setTutoriaSeleccionada(null)}>
          ← Volver a mis tutorías
        </button>
        <GestionContenido tutoriaId={tutoriaSeleccionada} onActualizada={cargarTutorias} />
      </div>
    )
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '.2rem' }}>Bienvenido/a, {usuario?.nombre}</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '.875rem' }}>Panel del instructor — {tutorias.length} tutoría{tutorias.length !== 1 ? 's' : ''} registrada{tutorias.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'mis-tutorias', label: 'Mis tutorías' },
          { id: 'nueva',        label: '+ Nueva tutoría' },
        ].map(t => (
          <button
            key={t.id}
            className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'mis-tutorias' && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Mis tutorías</h3>
          {cargando && <p aria-live="polite">Cargando tutorías...</p>}
          {errorLista && <p className="alert alert-error" role="alert">{errorLista}</p>}
          {!cargando && !errorLista && tutorias.length === 0 && (
            <p style={{ color: 'var(--color-muted)' }}>
              No tienes tutorías registradas aún.{' '}
              <button className="btn btn-outline btn-sm" onClick={() => setTab('nueva')}>Crear primera tutoría</button>
            </p>
          )}
          <div className="tutoria-grid">
            {tutorias.map(t => (
              <div key={t._id} className="tutoria-card">
                <h3>{t.titulo}</h3>
                <span className={`badge ${ESTADO_BADGE[t.estado] || 'badge-gray'}`}>{t.estado}</span>
                <div className="meta">
                  <span>${Number(t.precio).toLocaleString('es-CL')} CLP</span>
                  <span>{t.cuposOcupados}/{t.cuposTotal} inscritos</span>
                </div>
                <p style={{ fontSize: '.82rem', color: 'var(--color-muted)', marginBottom: '.75rem' }}>{t.categoria}</p>
                <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={() => setTutoriaSeleccionada(t._id)}>
                  Gestionar contenido
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'nueva' && (
        <FormularioNuevaTutoria
          onCreada={handleTutoriaCreada}
          onCancelar={() => setTab('mis-tutorias')}
        />
      )}
    </div>
  )
}
