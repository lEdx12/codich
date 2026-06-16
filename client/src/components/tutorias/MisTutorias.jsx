import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import VistaTutoriaInscrita from './VistaTutoriaInscrita.jsx'

export default function MisTutorias() {
  const [tutorias, setTutorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState('')
  const [vista, setVista]       = useState(null)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const { data } = await axiosInstance.get('/tutorias/mis-inscripciones')
      setTutorias(data.tutorias || [])
    } catch {
      setError('No se pudieron cargar tus tutorías.')
    } finally {
      setCargando(false)
    }
  }

  if (vista) return <VistaTutoriaInscrita tutoriaId={vista} onVolver={() => setVista(null)} />
  if (cargando) return <p aria-live="polite" style={{ padding: '1rem' }}>Cargando tus tutorías...</p>

  return (
    <section aria-labelledby="mis-tut-titulo">
      <h2 id="mis-tut-titulo" style={{ marginBottom: '1.5rem' }}>Mis tutorías</h2>
      {error && <p className="alert alert-error" role="alert">{error}</p>}

      {tutorias.length === 0 ? (
        <p style={{ color: 'var(--color-muted)' }}>
          Aún no estás inscrito en ninguna tutoría. Explora el catálogo para inscribirte.
        </p>
      ) : (
        <div className="tutoria-grid">
          {tutorias.map(t => {
            const numMateriales = t.materiales?.length || 0
            return (
              <div key={t._id} className="tutoria-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  height: 140,
                  background: t.imagen
                    ? `url(${t.imagen}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #1a2a1a 0%, #2c3e2c 60%, #1e3a2e 100%)',
                  position: 'relative',
                  flexShrink: 0,
                }}>
                  <span className="badge badge-gray" style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,.55)', color: '#fff', border: 'none' }}>{t.categoria}</span>
                </div>
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                  <h3 style={{ fontSize: '.97rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{t.titulo}</h3>
                  {t.instructor?.nombre && (
                    <p style={{ fontSize: '.75rem', color: 'var(--color-muted)', margin: 0 }}>
                      Instructor: <strong style={{ color: 'var(--color-text)' }}>{t.instructor.nombre}</strong>
                    </p>
                  )}
                  <p style={{ fontSize: '.75rem', color: 'var(--color-muted)', margin: 0 }}>
                    {numMateriales} material{numMateriales !== 1 ? 'es' : ''} disponible{numMateriales !== 1 ? 's' : ''}
                  </p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: '.25rem' }} onClick={() => setVista(t._id)}>
                    Acceder a la tutoría
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
