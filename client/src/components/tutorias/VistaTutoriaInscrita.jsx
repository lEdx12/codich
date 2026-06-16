import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { fmtTamano } from '../../utils/formato.js'

export default function VistaTutoriaInscrita({ tutoriaId, onVolver }) {
  const [tutoria, setTutoria]   = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    setCargando(true)
    axiosInstance.get(`/tutorias/${tutoriaId}`)
      .then(({ data }) => setTutoria(data))
      .catch(() => setError('No se pudo cargar la tutoría.'))
      .finally(() => setCargando(false))
  }, [tutoriaId])

  if (cargando) return <p aria-live="polite" style={{ padding: '1rem' }}>Cargando tutoría...</p>
  if (error || !tutoria) return <p className="alert alert-error" role="alert">{error || 'Tutoría no encontrada.'}</p>

  const materiales = tutoria.materiales || []

  return (
    <section aria-labelledby="vista-tut-titulo">
      <button className="btn btn-outline btn-sm" style={{ marginBottom: '1rem' }} onClick={onVolver}>
        ← Volver
      </button>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <span className="badge badge-gray">{tutoria.categoria}</span>
        <h2 id="vista-tut-titulo" style={{ margin: '.5rem 0' }}>{tutoria.titulo}</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: '.5rem' }}>{tutoria.descripcion}</p>
        {tutoria.instructor?.nombre && (
          <p style={{ fontSize: '.85rem', color: 'var(--color-muted)', margin: 0 }}>
            Instructor: <strong style={{ color: 'var(--color-text)' }}>{tutoria.instructor.nombre}</strong>
            {tutoria.instructor.especialidad ? ` · ${tutoria.instructor.especialidad}` : ''}
          </p>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>
          Material de la tutoría {materiales.length > 0 && <span style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '.85rem' }}>({materiales.length})</span>}
        </h3>
        {materiales.length === 0 ? (
          <p style={{ color: 'var(--color-muted)' }}>El instructor aún no ha subido material para esta tutoría.</p>
        ) : (
          <ul className="material-list">
            {materiales.map(m => (
              <li key={m._id} className="material-item">
                <span className={`badge ${m.formato === 'mp4' ? 'badge-yellow' : 'badge-gray'}`}>{m.formato?.toUpperCase()}</span>
                <span className="material-item__name">{m.nombreArchivo}</span>
                {m.tamano ? <span className="material-item__size">{fmtTamano(m.tamano)}</span> : null}
                <a href={m.urlArchivo} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Ver</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
