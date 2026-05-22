import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'

export default function CatalogoTutorias() {
  const [tutorias, setTutorias]           = useState([])
  const [pagina, setPagina]               = useState(1)
  const [totalPags, setTotalPags]         = useState(1)
  const [cargando, setCargando]           = useState(true)
  const [error, setError]                 = useState('')
  const [modalContratar, setModalContratar] = useState(null)
  const [procesando, setProcesando]       = useState(false)
  const [mensajeOk, setMensajeOk]         = useState('')

  useEffect(() => { cargarTutorias() }, [pagina])

  const cargarTutorias = async () => {
    setCargando(true)
    setError('')
    try {
      const { data } = await axiosInstance.get('/tutorias', { params: { pagina, limite: 20 } })
      setTutorias(data.tutorias)
      setTotalPags(data.totalPaginas)
    } catch {
      setError('No se pudo cargar el catálogo. Intenta más tarde.')
    } finally {
      setCargando(false)
    }
  }

  const handleContratar = async () => {
    if (!modalContratar) return
    setProcesando(true)
    try {
      const { data } = await axiosInstance.post('/tutorias/contratar', { tutoriaId: modalContratar._id })
      setModalContratar(null)
      setMensajeOk('¡Tutoría contratada! Redirigiendo al pago...')
      if (data.urlPago) window.location.href = data.urlPago
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al contratar la tutoría.')
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) return <p aria-live="polite" style={{ padding: '2rem' }}>Cargando tutorías...</p>

  return (
    <section aria-labelledby="titulo-catalogo">
      <h2 id="titulo-catalogo" style={{ marginBottom: '1.5rem' }}>Catálogo de tutorías</h2>
      {error     && <p className="alert alert-error"   role="alert">{error}</p>}
      {mensajeOk && <p className="alert alert-success" role="status">{mensajeOk}</p>}

      {tutorias.length === 0
        ? <p style={{ color: 'var(--color-muted)' }}>No hay tutorías disponibles por el momento.</p>
        : (
          <div className="tutoria-grid">
            {tutorias.map(t => (
              <div key={t._id} className="tutoria-card">
                <h3>{t.titulo}</h3>
                <p className="desc">{t.descripcion.length > 120 ? t.descripcion.slice(0, 120) + '…' : t.descripcion}</p>
                <span className="badge badge-gray" style={{ alignSelf: 'start' }}>{t.categoria}</span>
                <div className="meta">
                  <strong>${t.precio.toLocaleString('es-CL')} CLP</strong>
                  <span>{t.cuposDisponibles} cupos</span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setModalContratar(t)}
                  disabled={t.cuposDisponibles === 0}
                  aria-disabled={t.cuposDisponibles === 0}
                >
                  {t.cuposDisponibles === 0 ? 'Sin cupos' : 'Contratar'}
                </button>
              </div>
            ))}
          </div>
        )
      }

      <nav className="pagination" aria-label="Páginas del catálogo">
        <button className="btn btn-outline btn-sm" onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>← Anterior</button>
        <span>Página {pagina} de {totalPags}</span>
        <button className="btn btn-outline btn-sm" onClick={() => setPagina(p => p + 1)} disabled={pagina >= totalPags}>Siguiente →</button>
      </nav>

      {modalContratar && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-contratar">
          <div className="modal">
            <h3 id="modal-contratar">Confirmar contratación</h3>
            <p style={{ margin: '1rem 0' }}>Tutoría: <strong>{modalContratar.titulo}</strong></p>
            <p style={{ marginBottom: '1rem' }}>Total: <strong>${modalContratar.precio.toLocaleString('es-CL')} CLP</strong></p>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={handleContratar} disabled={procesando}>
                {procesando ? 'Procesando...' : 'Confirmar y pagar'}
              </button>
              <button className="btn btn-outline" onClick={() => setModalContratar(null)} disabled={procesando}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
