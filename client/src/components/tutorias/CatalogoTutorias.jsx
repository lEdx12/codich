import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'

function SimuladorPagoTutoria({ tutoria, pagoId, onResultado, onCancelar }) {
  const [procesando, setProcesando] = useState(false)
  const [error, setError]           = useState('')

  const handleSimular = async (aprobado) => {
    setProcesando(true)
    setError('')
    try {
      const { data } = await axiosInstance.post(`/tutorias/${tutoria._id}/simular-pago`, { pagoId, aprobado })
      onResultado(data)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al procesar el pago.')
      setProcesando(false)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="sim-titulo">
      <div className="modal" style={{ maxWidth: 460 }}>
        <div style={{ background: 'var(--color-primary-dark)', color: '#fff', borderRadius: '8px 8px 0 0', padding: '.75rem 1rem', margin: '-1.5rem -1.5rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800 }}>CODICH Pay — Simulador</span>
          <span style={{ background: 'rgba(255,255,255,.15)', borderRadius: '6px', padding: '.2rem .6rem', fontSize: '.72rem', fontWeight: 700 }}>SANDBOX</span>
        </div>
        <h3 id="sim-titulo" style={{ marginBottom: '.5rem' }}>{tutoria.titulo}</h3>
        <p style={{ color: 'var(--color-muted)', fontSize: '.85rem', marginBottom: '1rem' }}>
          Monto: <strong style={{ color: 'var(--color-text)' }}>${tutoria.precio.toLocaleString('es-CL')} CLP</strong>
        </p>
        <p style={{ fontSize: '.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '.5rem .75rem', marginBottom: '1.25rem' }}>
          ⚠ Simulador de pruebas — ningún dato es procesado realmente
        </p>
        {error && <p className="alert alert-error" role="alert">{error}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '.75rem' }}>
          <button className="btn btn-primary" onClick={() => handleSimular(true)} disabled={procesando}
            style={{ background: '#16a34a', borderColor: '#16a34a' }}>
            {procesando ? 'Procesando...' : '✓ Aprobar pago'}
          </button>
          <button className="btn btn-outline" onClick={() => handleSimular(false)} disabled={procesando}
            style={{ borderColor: '#dc2626', color: '#dc2626' }}>
            ✗ Rechazar pago
          </button>
        </div>
        <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={onCancelar} disabled={procesando}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function CatalogoTutorias() {
  const [tutorias, setTutorias]               = useState([])
  const [pagina, setPagina]                   = useState(1)
  const [totalPags, setTotalPags]             = useState(1)
  const [cargando, setCargando]               = useState(true)
  const [error, setError]                     = useState('')
  const [modalContratar, setModalContratar]   = useState(null)
  const [procesando, setProcesando]           = useState(false)
  const [mensajeOk, setMensajeOk]             = useState('')
  const [simulador, setSimulador]             = useState(null)

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
    setError('')
    try {
      const { data } = await axiosInstance.post('/tutorias/contratar', { tutoriaId: modalContratar._id })
      setModalContratar(null)

      if (data.inscrito) {
        setMensajeOk(data.mensaje)
        await cargarTutorias()
        return
      }

      if (data.pagoId) {
        setSimulador({ tutoria: modalContratar, pagoId: data.pagoId })
        return
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al contratar la tutoría.')
    } finally {
      setProcesando(false)
    }
  }

  const handleResultadoPago = async (resultado) => {
    setSimulador(null)
    if (resultado.aprobado) {
      setMensajeOk(resultado.mensaje)
      await cargarTutorias()
    } else {
      setError(resultado.mensaje)
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
              <div key={t._id} className="tutoria-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  height: 155,
                  background: t.imagen
                    ? `url(${t.imagen}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #1a2a1a 0%, #2c3e2c 60%, #1e3a2e 100%)',
                  position: 'relative',
                  flexShrink: 0,
                }}>
                  <span className="badge badge-gray" style={{ position: 'absolute', top: 10, left: 10, backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,.55)', color: '#fff', border: 'none' }}>{t.categoria}</span>
                  {t.cuposDisponibles === 0 && (
                    <span style={{ position: 'absolute', top: 10, right: 10, background: '#dc2626', color: '#fff', fontSize: '.68rem', fontWeight: 700, padding: '.2rem .5rem', borderRadius: '20px' }}>Sin cupos</span>
                  )}
                </div>
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                  <h3 style={{ fontSize: '.97rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{t.titulo}</h3>
                  <p style={{ fontSize: '.8rem', color: 'var(--color-muted)', flex: 1, margin: 0 }}>
                    {t.descripcion.length > 100 ? t.descripcion.slice(0, 100) + '…' : t.descripcion}
                  </p>
                  {t.instructor?.nombre && (
                    <p style={{ fontSize: '.75rem', color: 'var(--color-muted)', margin: 0 }}>
                      Instructor: <strong style={{ color: 'var(--color-text)' }}>{t.instructor.nombre}</strong>
                    </p>
                  )}
                  <p style={{ fontSize: '.75rem', color: 'var(--color-muted)', margin: 0 }}>
                    {t.cuposDisponibles} cupo{t.cuposDisponibles !== 1 ? 's' : ''} disponible{t.cuposDisponibles !== 1 ? 's' : ''}
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '.25rem' }}
                    onClick={() => { setError(''); setMensajeOk(''); setModalContratar(t) }}
                    disabled={t.cuposDisponibles === 0}
                    aria-disabled={t.cuposDisponibles === 0}
                  >
                    {t.cuposDisponibles === 0 ? 'Sin cupos' : 'Inscribirse'}
                  </button>
                </div>
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

      {modalContratar && !simulador && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-contratar">
          <div className="modal">
            <h3 id="modal-contratar">Confirmar inscripción</h3>
            <p style={{ margin: '1rem 0' }}>Tutoría: <strong>{modalContratar.titulo}</strong></p>
            <p style={{ fontSize: '.8rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
              Con tu membresía activa, el acceso es inmediato y sin costo adicional.
            </p>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={handleContratar} disabled={procesando}>
                {procesando ? 'Procesando...' : 'Confirmar inscripción'}
              </button>
              <button className="btn btn-outline" onClick={() => setModalContratar(null)} disabled={procesando}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {simulador && (
        <SimuladorPagoTutoria
          tutoria={simulador.tutoria}
          pagoId={simulador.pagoId}
          onResultado={handleResultadoPago}
          onCancelar={() => setSimulador(null)}
        />
      )}
    </section>
  )
}
