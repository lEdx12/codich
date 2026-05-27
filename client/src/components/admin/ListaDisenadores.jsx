import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'

function estadoMembresia(m) {
  if (!m) return { label: 'Sin membresía', cls: 'badge-gray' }
  if (m.estado === 'activa' && m.fechaFin && new Date(m.fechaFin) > new Date())
    return { label: `Activa — vence ${new Date(m.fechaFin).toLocaleDateString('es-CL')}`, cls: 'badge-green' }
  if (m.estado === 'pendiente') return { label: 'Pago pendiente', cls: 'badge-yellow' }
  return { label: 'Inactiva', cls: 'badge-red' }
}

export default function ListaDisenadores() {
  const [disenadores, setDisenadores] = useState([])
  const [cargando, setCargando]       = useState(true)
  const [error, setError]             = useState('')
  const [busqueda, setBusqueda]       = useState('')

  useEffect(() => {
    axiosInstance.get('/instructores/disenadores')
      .then(({ data }) => setDisenadores(data))
      .catch(() => setError('No se pudo cargar la lista de diseñadores.'))
      .finally(() => setCargando(false))
  }, [])

  const filtrados = disenadores.filter(d =>
    d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.correo.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (cargando) return <p aria-live="polite">Cargando diseñadores...</p>

  return (
    <section className="card" aria-labelledby="titulo-disenadores">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <h2 id="titulo-disenadores" style={{ margin: 0 }}>Usuarios diseñadores</h2>
        <span style={{ fontSize: '.85rem', color: 'var(--color-muted)' }}>{filtrados.length} usuario{filtrados.length !== 1 ? 's' : ''}</span>
      </div>

      {error && <p className="alert alert-error" role="alert">{error}</p>}

      <div className="form-group" style={{ maxWidth: 320, marginBottom: '1rem' }}>
        <input
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          aria-label="Buscar diseñador"
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Estado cuenta</th>
              <th>Membresía</th>
              <th>Plan</th>
              <th>Registro</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
                {busqueda ? 'Sin resultados para la búsqueda.' : 'Sin diseñadores registrados.'}
              </td></tr>
            )}
            {filtrados.map(d => {
              const mem = estadoMembresia(d.membresia)
              return (
                <tr key={d._id}>
                  <td>{d.nombre}</td>
                  <td style={{ fontSize: '.85rem' }}>{d.correo}</td>
                  <td>
                    <span className={`badge ${d.estado === 'activo' ? 'badge-green' : 'badge-red'}`}>{d.estado}</span>
                  </td>
                  <td>
                    <span className={`badge ${mem.cls}`} style={{ fontSize: '.75rem', whiteSpace: 'nowrap' }}>{mem.label}</span>
                  </td>
                  <td style={{ fontSize: '.85rem', textTransform: 'capitalize' }}>{d.membresia?.plan || '—'}</td>
                  <td style={{ fontSize: '.8rem', color: 'var(--color-muted)' }}>
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString('es-CL') : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
