import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { CATEGORIAS, ESTADOS } from '../../constants/tutorias.js'

const MAX_DESC    = 500
const MAX_BYTES   = 10 * 1024 * 1024
const FORMATOS_OK = ['application/pdf', 'video/mp4']

function TabInscritos({ tutoriaId }) {
  const [inscritos, setInscritos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    axiosInstance.get(`/tutorias/${tutoriaId}/inscritos`)
      .then(({ data }) => setInscritos(data))
      .catch(() => setError('No se pudo cargar la lista de inscritos.'))
      .finally(() => setCargando(false))
  }, [tutoriaId])

  if (cargando) return <p aria-live="polite">Cargando inscritos...</p>
  if (error)    return <p className="alert alert-error" role="alert">{error}</p>

  return (
    <div>
      <p style={{ color: 'var(--color-muted)', fontSize: '.875rem', marginBottom: '1rem' }}>
        {inscritos.length} alumno{inscritos.length !== 1 ? 's' : ''} inscrito{inscritos.length !== 1 ? 's' : ''}
      </p>
      {inscritos.length === 0 ? (
        <p style={{ color: 'var(--color-muted)' }}>Aún no hay alumnos inscritos en esta tutoría.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Correo</th><th>Estado inscripción</th></tr>
            </thead>
            <tbody>
              {inscritos.map(i => (
                <tr key={i._id}>
                  <td>{i.usuario?.nombre || '—'}</td>
                  <td>{i.usuario?.correo || '—'}</td>
                  <td><span className={`badge ${i.estado === 'activa' ? 'badge-green' : 'badge-yellow'}`}>{i.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function GestionContenido({ tutoriaId, onActualizada }) {
  const [tutoria, setTutoria]           = useState(null)
  const [cargando, setCargando]         = useState(true)
  const [guardando, setGuardando]       = useState(false)
  const [error, setError]               = useState('')
  const [ok, setOk]                     = useState('')
  const [archivo, setArchivo]           = useState(null)
  const [errorArchivo, setErrorArchivo] = useState('')
  const [tab, setTab]                   = useState('editar')

  useEffect(() => {
    axiosInstance.get(`/tutorias/${tutoriaId}`)
      .then(({ data }) => setTutoria(data))
      .catch(() => setError('No se pudo cargar la tutoría.'))
      .finally(() => setCargando(false))
  }, [tutoriaId])

  const handleChange = e => setTutoria({ ...tutoria, [e.target.name]: e.target.value })

  const handleArchivo = e => {
    const file = e.target.files[0]
    setErrorArchivo('')
    if (!file) return
    if (!FORMATOS_OK.includes(file.type)) { setErrorArchivo('Solo se aceptan archivos PDF o MP4.'); setArchivo(null); return }
    if (file.size > MAX_BYTES)             { setErrorArchivo('El archivo no puede superar los 10 MB.'); setArchivo(null); return }
    setArchivo(file)
  }

  const handleGuardar = async e => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    setOk('')
    try {
      if (archivo) {
        const formData = new FormData()
        formData.append('tutoriaId', tutoriaId)
        formData.append('material',  archivo)
        await axiosInstance.post('/materiales', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      await axiosInstance.put(`/tutorias/${tutoriaId}`, {
        titulo:      tutoria.titulo,
        descripcion: tutoria.descripcion,
        estado:      tutoria.estado,
        categoria:   tutoria.categoria,
        cuposTotal:  Number(tutoria.cuposTotal),
        imagen:      tutoria.imagen || '',
      })
      setOk('Cambios guardados correctamente.')
      setArchivo(null)
      if (onActualizada) onActualizada()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar los cambios.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <p>Cargando...</p>
  if (!tutoria) return <p className="alert alert-error" role="alert">{error || 'Tutoría no encontrada.'}</p>

  return (
    <section className="card" aria-labelledby="titulo-contenido">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 id="titulo-contenido" style={{ marginBottom: '.2rem' }}>{tutoria.titulo}</h2>
          <span className={`badge ${tutoria.estado === 'activa' ? 'badge-green' : tutoria.estado === 'inactiva' ? 'badge-red' : 'badge-yellow'}`}>
            {tutoria.estado}
          </span>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '.75rem' }}>
        {[
          { id: 'editar',    label: 'Editar contenido' },
          { id: 'inscritos', label: 'Ver inscritos' },
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

      {tab === 'editar' && (
        <>
          {error && <p className="alert alert-error" role="alert">{error}</p>}
          {ok    && <p className="alert alert-success" role="status">{ok}</p>}
          <form onSubmit={handleGuardar} style={{ maxWidth: 560 }}>
            <div className="form-group">
              <label>Título</label>
              <input name="titulo" value={tutoria.titulo} onChange={handleChange} required maxLength={200} />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion" value={tutoria.descripcion} onChange={handleChange}
                maxLength={MAX_DESC} required rows={4} aria-describedby="contador-desc"
              />
              <span id="contador-desc" aria-live="polite" style={{ fontSize: '.8rem', color: 'var(--color-muted)' }}>
                {tutoria.descripcion?.length || 0}/{MAX_DESC} caracteres
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Categoría</label>
                <select name="categoria" value={tutoria.categoria || ''} onChange={handleChange}>
                  <option value="">-- Seleccionar --</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Cupos totales</label>
                <input
                  name="cuposTotal" type="number" value={tutoria.cuposTotal || ''}
                  min={tutoria.cuposOcupados || 1} onChange={handleChange}
                />
                <span style={{ fontSize: '.78rem', color: 'var(--color-muted)' }}>
                  {tutoria.cuposOcupados || 0} inscritos · no puedes bajar de ese número
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Imagen de referencia (URL)</label>
              <input name="imagen" type="url" value={tutoria.imagen || ''} onChange={handleChange} placeholder="https://ejemplo.com/imagen.jpg" />
              {tutoria.imagen && (
                <img src={tutoria.imagen} alt="Vista previa" onError={e => e.target.style.display='none'} style={{ marginTop: '.5rem', width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
              )}
            </div>

            <div className="form-group">
              <label>Estado de la tutoría</label>
              <select name="estado" value={tutoria.estado} onChange={handleChange}>
                {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Subir material (PDF o MP4, máx. 10 MB)</label>
              <input type="file" accept=".pdf,.mp4" onChange={handleArchivo} />
              {errorArchivo && <span className="field-error" role="alert">{errorArchivo}</span>}
              {archivo && <span style={{ fontSize: '.85rem', color: 'var(--color-success)' }}>✔ {archivo.name}</span>}
            </div>

            <div className="btn-row">
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </>
      )}

      {tab === 'inscritos' && <TabInscritos tutoriaId={tutoriaId} />}
    </section>
  )
}
