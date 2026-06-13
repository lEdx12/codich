import { useState, useEffect } from 'react'
import { useAuth }              from '../hooks/useAuth.js'
import GestionContenido         from '../components/tutorias/GestionContenido.jsx'
import axiosInstance            from '../api/axiosInstance.js'
import { CATEGORIAS, ESTADO_BADGE } from '../constants/tutorias.js'

const NAV = [
  { id: 'resumen',      label: 'Resumen',        icon: '▦' },
  { id: 'mis-tutorias', label: 'Mis tutorías',   icon: '▤' },
  { id: 'nueva',        label: 'Nueva tutoría',  icon: '+' },
]

function KpiCard({ icon, label, value, sub, accent }) {
  return (
    <div className="kpi-card" style={{ borderLeftColor: accent }}>
      <div className="kpi-card__icon" style={{ background: `${accent}1a`, color: accent }}>{icon}</div>
      <div className="kpi-card__body">
        <span className="kpi-card__label">{label}</span>
        <span className="kpi-card__value">{value}</span>
        {sub && <span className="kpi-card__sub">{sub}</span>}
      </div>
    </div>
  )
}

function FormularioNuevaTutoria({ onCreada, onCancelar }) {
  const [form, setForm]     = useState({ titulo: '', descripcion: '', cuposTotal: '', categoria: '', imagen: '' })
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
            <label>Cupos totales <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input name="cuposTotal" type="number" min="1" value={form.cuposTotal} onChange={handleChange} required placeholder="20" />
          </div>
          <div className="form-group">
            <label>Categoría <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <select name="categoria" value={form.categoria} onChange={handleChange} required>
              <option value="">-- Seleccionar --</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Imagen de referencia (URL)</label>
          <input name="imagen" type="url" value={form.imagen} onChange={handleChange} placeholder="https://ejemplo.com/imagen.jpg" />
          {form.imagen && (
            <img src={form.imagen} alt="Vista previa" onError={e => e.target.style.display='none'} style={{ marginTop: '.5rem', width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
          )}
        </div>
        <p className="alert alert-info" style={{ fontSize: '.82rem' }}>
          El acceso a las tutorías está incluido en la membresía de los diseñadores, por lo que <strong>no se define precio</strong>. La tutoría se publica activa de inmediato.
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

function VistaResumen({ tutorias, onNueva }) {
  const total       = tutorias.length
  const activas     = tutorias.filter(t => t.estado === 'activa').length
  const inscritos   = tutorias.reduce((a, t) => a + (t.cuposOcupados || 0), 0)
  const disponibles = tutorias.reduce((a, t) => a + ((t.cuposTotal || 0) - (t.cuposOcupados || 0)), 0)

  return (
    <section aria-labelledby="titulo-resumen">
      <h2 id="titulo-resumen" style={{ marginBottom: '1.25rem' }}>Resumen de tu actividad</h2>
      <div className="kpi-grid">
        <KpiCard icon="▤" label="Tutorías totales"  value={total}       sub={`${activas} activas`}            accent="#1a3a5c" />
        <KpiCard icon="●" label="Tutorías activas"   value={activas}     sub="Visibles en el catálogo"        accent="#16a34a" />
        <KpiCard icon="◆" label="Alumnos inscritos"  value={inscritos}   sub="En todas tus tutorías"          accent="#e8562a" />
        <KpiCard icon="◇" label="Cupos disponibles"  value={disponibles} sub="Capacidad libre restante"       accent="#2d5986" />
      </div>

      {total === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1rem' }}>Aún no has creado tutorías.</p>
          <button className="btn btn-primary" onClick={onNueva}>+ Crear primera tutoría</button>
        </div>
      )}
    </section>
  )
}

export default function DashboardInstructor() {
  const { usuario }                                   = useAuth()
  const [tutorias, setTutorias]                       = useState([])
  const [cargando, setCargando]                       = useState(true)
  const [tutoriaSeleccionada, setTutoriaSeleccionada] = useState(null)
  const [tab, setTab]                                 = useState('resumen')
  const [errorLista, setErrorLista]                   = useState('')

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

  const irA = (id) => { setTutoriaSeleccionada(null); setTab(id) }

  const activo  = NAV.find(n => n.id === tab)
  const titulo  = tutoriaSeleccionada ? 'Gestión de tutoría' : (activo?.label || '')

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__head">
          <span className="admin-sidebar__title">Instructor</span>
          <span className="admin-sidebar__user">{usuario?.nombre}</span>
        </div>
        <nav className="admin-sidebar__nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`admin-navitem ${tab === n.id && !tutoriaSeleccionada ? 'is-active' : ''}`}
              onClick={() => irA(n.id)}
            >
              <span className="admin-navitem__icon" aria-hidden="true">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin-content">
        <header className="admin-content__header">
          <h1 className="admin-content__title">{titulo}</h1>
          <p className="admin-content__crumb">Panel CODICH · {titulo}</p>
        </header>

        {tutoriaSeleccionada ? (
          <>
            <button className="btn btn-outline btn-sm" style={{ marginBottom: '1rem' }} onClick={() => setTutoriaSeleccionada(null)}>
              ← Volver a mis tutorías
            </button>
            <GestionContenido tutoriaId={tutoriaSeleccionada} onActualizada={cargarTutorias} />
          </>
        ) : (
          <>
            {tab === 'resumen' && (
              cargando
                ? <p aria-live="polite">Cargando métricas...</p>
                : <VistaResumen tutorias={tutorias} onNueva={() => setTab('nueva')} />
            )}

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
                  {tutorias.map(t => {
                    const ocupacion = t.cuposTotal ? Math.round((t.cuposOcupados / t.cuposTotal) * 100) : 0
                    return (
                      <div key={t._id} className="tutoria-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: 120,
                            background: t.imagen
                              ? `center/cover no-repeat url(${t.imagen})`
                              : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-mid) 100%)',
                            position: 'relative',
                          }}
                        >
                          <span className={`badge ${ESTADO_BADGE[t.estado] || 'badge-gray'}`} style={{ position: 'absolute', top: 10, right: 10 }}>
                            {t.estado}
                          </span>
                        </div>
                        <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
                          <span style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--color-muted)', fontWeight: 700 }}>{t.categoria}</span>
                          <h3 style={{ margin: '.25rem 0 .6rem' }}>{t.titulo}</h3>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', color: 'var(--color-muted)', marginBottom: '.4rem' }}>
                            <span>{t.cuposOcupados}/{t.cuposTotal} inscritos</span>
                            <span>{ocupacion}% ocupado</span>
                          </div>
                          <div className="toplist__bar-track" style={{ marginBottom: '.9rem' }}>
                            <div className="toplist__bar-fill" style={{ width: `${ocupacion}%` }} />
                          </div>
                          <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => setTutoriaSeleccionada(t._id)}>
                            Gestionar
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {tab === 'nueva' && (
              <FormularioNuevaTutoria
                onCreada={handleTutoriaCreada}
                onCancelar={() => setTab('mis-tutorias')}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
