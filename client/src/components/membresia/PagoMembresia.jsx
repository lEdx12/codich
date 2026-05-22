import { useState } from 'react'
import axiosInstance from '../../api/axiosInstance'

const PLANES = [
  { id: 'mensual', label: 'Membresía Mensual', precio: 9990,  desc: 'Acceso por 1 mes a todas las tutorías' },
  { id: 'anual',   label: 'Membresía Anual',   precio: 89990, desc: 'Acceso por 12 meses — ahorra un 25%' },
  { id: 'senior',  label: 'Membresía Senior',  precio: 59990, desc: 'Para diseñadores senior, acceso anual' },
]

export default function PagoMembresia() {
  const [planSeleccionado, setPlanSeleccionado] = useState(null)
  const [confirmando, setConfirmando]           = useState(false)
  const [cargando, setCargando]                 = useState(false)
  const [resultado, setResultado]               = useState(null)
  const [error, setError]                       = useState('')

  const handleConfirmar = () => {
    if (!planSeleccionado) return
    setConfirmando(true)
  }

  const handlePagar = async () => {
    setCargando(true)
    setError('')
    try {
      const { data } = await axiosInstance.post('/membresia/pagar', { plan: planSeleccionado.id })
      window.location.href = data.urlPago
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al iniciar el pago. Intenta nuevamente.')
    } finally {
      setCargando(false)
      setConfirmando(false)
    }
  }

  if (resultado) {
    return (
      <div className="card" role="alert" aria-live="polite" style={{ textAlign: 'center' }}>
        {resultado.exito
          ? <p className="alert alert-success">✅ {resultado.mensaje}</p>
          : <p className="alert alert-error">❌ {resultado.mensaje}</p>
        }
      </div>
    )
  }

  return (
    <section className="card" aria-labelledby="titulo-pago">
      <h2 id="titulo-pago" style={{ marginBottom: '1.5rem' }}>Pagar membresía</h2>

      <div className="plan-grid">
        {PLANES.map(plan => (
          <div
            key={plan.id}
            className={`plan-card${planSeleccionado?.id === plan.id ? ' selected' : ''}`}
            onClick={() => { setPlanSeleccionado(plan); setConfirmando(false) }}
            role="radio"
            aria-checked={planSeleccionado?.id === plan.id}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setPlanSeleccionado(plan)}
          >
            <span className="plan-name">{plan.label}</span>
            <span className="plan-price">${plan.precio.toLocaleString('es-CL')} CLP</span>
            <span style={{ fontSize: '.8rem', color: 'var(--color-muted)' }}>{plan.desc}</span>
          </div>
        ))}
      </div>

      {!confirmando && (
        <div className="btn-row">
          <button className="btn btn-primary" onClick={handleConfirmar} disabled={!planSeleccionado}>
            Continuar al pago
          </button>
        </div>
      )}

      {confirmando && planSeleccionado && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-titulo">
          <div className="modal">
            <h3 id="confirm-titulo">Confirmar pago</h3>
            <p style={{ margin: '.75rem 0' }}>Plan: <strong>{planSeleccionado.label}</strong></p>
            <p style={{ marginBottom: '1rem' }}>Total: <strong>${planSeleccionado.precio.toLocaleString('es-CL')} CLP</strong></p>
            <p style={{ fontSize: '.875rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
              Serás redirigido a la pasarela de pago segura de Flow.
            </p>
            {error && <p className="alert alert-error" role="alert">{error}</p>}
            <div className="btn-row">
              <button className="btn btn-primary" onClick={handlePagar} disabled={cargando}>
                {cargando ? 'Procesando...' : 'Confirmar y pagar'}
              </button>
              <button className="btn btn-outline" onClick={() => setConfirmando(false)} disabled={cargando}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
