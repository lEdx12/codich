import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'

const MAX_DESC  = 500
const MAX_BYTES = 10 * 1024 * 1024
const FORMATOS_OK = ['application/pdf', 'video/mp4']

export default function GestionContenido({ tutoriaId }) {
  const [tutoria, setTutoria]   = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError]       = useState('')
  const [ok, setOk]             = useState('')
  const [archivo, setArchivo]   = useState(null)
  const [errorArchivo, setErrorArchivo] = useState('')

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
      })
      setOk('Cambios guardados correctamente.')
      setArchivo(null)
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
      <h2 id="titulo-contenido" style={{ marginBottom: '1.5rem' }}>Editar tutoría</h2>
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
    </section>
  )
}
