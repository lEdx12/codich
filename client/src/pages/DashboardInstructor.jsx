import { useState, useEffect } from 'react'
import { useAuth }              from '../hooks/useAuth.js'
import GestionContenido         from '../components/tutorias/GestionContenido.jsx'
import axiosInstance            from '../api/axiosInstance.js'

export default function DashboardInstructor() {
  const { usuario }        = useAuth()
  const [tutorias, setTutorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [tutoriaSeleccionada, setTutoriaSeleccionada] = useState(null)

  useEffect(() => {
    axiosInstance.get('/tutorias')
      .then(({ data }) => setTutorias(data.tutorias))
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <h2 style={{ marginBottom: '.25rem' }}>Bienvenido/a, {usuario?.nombre}</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '.875rem' }}>Panel del instructor</p>
      </div>

      {!tutoriaSeleccionada ? (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Mis tutorías</h3>
          {cargando && <p>Cargando...</p>}
          {!cargando && tutorias.length === 0 && (
            <p style={{ color: 'var(--color-muted)' }}>No tienes tutorías asignadas aún.</p>
          )}
          <div className="tutoria-grid">
            {tutorias.map(t => (
              <div key={t._id} className="tutoria-card">
                <h3>{t.titulo}</h3>
                <span className={`badge ${t.estado === 'activa' ? 'badge-green' : t.estado === 'inactiva' ? 'badge-red' : 'badge-yellow'}`}>
                  {t.estado}
                </span>
                <div className="meta">
                  <span>${t.precio?.toLocaleString('es-CL')} CLP</span>
                  <span>{t.cuposOcupados}/{t.cuposTotal} inscritos</span>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => setTutoriaSeleccionada(t._id)}>
                  Gestionar contenido
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button className="btn btn-outline btn-sm" style={{ marginBottom: '1rem' }} onClick={() => setTutoriaSeleccionada(null)}>
            ← Volver a mis tutorías
          </button>
          <GestionContenido tutoriaId={tutoriaSeleccionada} />
        </div>
      )}
    </div>
  )
}
