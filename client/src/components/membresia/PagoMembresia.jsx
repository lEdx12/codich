import { useState } from 'react'
import axiosInstance from '../../api/axiosInstance'

const PLANES = [
  { id: 'mensual', label: 'Membresía Mensual', precio: 9990,  desc: 'Acceso por 1 mes a todas las tutorías',      badge: null },
  { id: 'anual',   label: 'Membresía Anual',   precio: 89990, desc: 'Acceso por 12 meses — ahorra un 25%',        badge: 'Popular' },
  { id: 'senior',  label: 'Membresía Senior',  precio: 59990, desc: 'Para diseñadores senior, acceso anual',      badge: null },
]

function formatCard(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function SimuladorPago({ plan, pagoId, onResultado, onVolver }) {
  const [card, setCard]       = useState({ numero: '', nombre: '', expiry: '', cvv: '' })
  const [procesando, setProcesando] = useState(false)
  const [error, setError]     = useState('')

  const handleSimular = async (aprobado) => {
    setProcesando(true)
    setError('')
    try {
      const { data } = await axiosInstance.post('/membresia/simular', { pagoId, aprobado })
      onResultado(data)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al procesar el pago.')
      setProcesando(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>

      {/* Cabecera simulador */}
      <div style={{ background: 'var(--color-primary-dark)', color: '#fff', borderRadius: '12px 12px 0 0', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '.7rem', opacity: .7, marginBottom: '.15rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Entorno de pruebas</p>
          <span style={{ fontWeight: 800, fontSize: '1rem' }}>CODICH Pay — Simulador</span>
        </div>
        <span style={{ background: 'rgba(255,255,255,.15)', borderRadius: '8px', padding: '.3rem .7rem', fontSize: '.75rem', fontWeight: 700 }}>SANDBOX</span>
      </div>

      <div style={{ border: '1px solid var(--color-border)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '1.5rem', background: '#fff' }}>

        {/* Resumen del plan */}
        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 700, marginBottom: '.2rem' }}>{plan.label}</p>
            <p style={{ fontSize: '.8rem', color: 'var(--color-muted)' }}>{plan.desc}</p>
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
            ${plan.precio.toLocaleString('es-CL')} CLP
          </span>
        </div>

        {/* Formulario visual de tarjeta */}
        <div className="form-group">
          <label style={{ fontSize: '.8rem' }}>Número de tarjeta</label>
          <input
            placeholder="1234 5678 9012 3456"
            value={card.numero}
            onChange={e => setCard({ ...card, numero: formatCard(e.target.value) })}
            maxLength={19}
            style={{ letterSpacing: '2px', fontFamily: 'monospace' }}
          />
        </div>
        <div className="form-group">
          <label style={{ fontSize: '.8rem' }}>Nombre en la tarjeta</label>
          <input placeholder="JUAN DISEÑADOR" value={card.nombre} onChange={e => setCard({ ...card, nombre: e.target.value.toUpperCase() })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '.8rem' }}>Vencimiento</label>
            <input placeholder="MM/AA" value={card.expiry} maxLength={5}
              onChange={e => {
                let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
                setCard({ ...card, expiry: v })
              }}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '.8rem' }}>CVV</label>
            <input placeholder="•••" type="password" maxLength={4} value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })} />
          </div>
        </div>

        {error && <p className="alert alert-error" role="alert">{error}</p>}

        <p style={{ fontSize: '.75rem', color: 'var(--color-muted)', textAlign: 'center', margin: '1rem 0 .75rem', padding: '.5rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px' }}>
          ⚠ Simulador de pruebas — ningún dato bancario es procesado ni almacenado
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          <button
            className="btn btn-primary"
            onClick={() => handleSimular(true)}
            disabled={procesando}
            style={{ background: '#16a34a', borderColor: '#16a34a' }}
          >
            {procesando ? 'Procesando...' : '✓ Simular pago aprobado'}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => handleSimular(false)}
            disabled={procesando}
            style={{ borderColor: '#dc2626', color: '#dc2626' }}
          >
            ✗ Simular pago rechazado
          </button>
        </div>

        <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '.75rem' }} onClick={onVolver} disabled={procesando}>
          ← Volver a los planes
        </button>
      </div>
    </div>
  )
}

function ResultadoPago({ resultado, onNuevoPago }) {
  const { aprobado, mensaje, transaccion, membresia } = resultado
  return (
    <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }} role="alert" aria-live="polite">
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{aprobado ? '✅' : '❌'}</div>
      <h3 style={{ color: aprobado ? 'var(--color-success)' : 'var(--color-error)', marginBottom: '.75rem' }}>
        {aprobado ? 'Pago aprobado' : 'Pago rechazado'}
      </h3>
      <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>{mensaje}</p>

      {aprobado && membresia && (
        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left', maxWidth: 340, margin: '0 auto 1.5rem' }}>
          <p style={{ fontWeight: 700, marginBottom: '.5rem' }}>Detalles de la membresía</p>
          <p style={{ fontSize: '.85rem', color: 'var(--color-muted)' }}>Plan: <strong style={{ color: 'var(--color-text)' }}>{membresia.plan}</strong></p>
          <p style={{ fontSize: '.85rem', color: 'var(--color-muted)' }}>Estado: <span className="badge badge-green">{membresia.estado}</span></p>
          <p style={{ fontSize: '.85rem', color: 'var(--color-muted)' }}>
            Válida hasta: <strong style={{ color: 'var(--color-text)' }}>
              {membresia.fechaFin ? new Date(membresia.fechaFin).toLocaleDateString('es-CL') : '—'}
            </strong>
          </p>
          {transaccion && <p style={{ fontSize: '.8rem', color: 'var(--color-muted)', marginTop: '.5rem' }}>N° transacción: <code style={{ fontSize: '.8rem' }}>{transaccion}</code></p>}
        </div>
      )}

      {!aprobado && (
        <button className="btn btn-primary" onClick={onNuevoPago}>Intentar nuevamente</button>
      )}
    </div>
  )
}

export default function PagoMembresia() {
  const [vista, setVista]               = useState('planes')
  const [planSeleccionado, setPlan]     = useState(null)
  const [pagoId, setPagoId]             = useState(null)
  const [cargando, setCargando]         = useState(false)
  const [error, setError]               = useState('')
  const [resultado, setResultado]       = useState(null)

  const handleIrAPagar = async () => {
    if (!planSeleccionado) return
    setCargando(true)
    setError('')
    try {
      const { data } = await axiosInstance.post('/membresia/pagar', { plan: planSeleccionado.id })
      setPagoId(data.pagoId)
      setVista('simulador')
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al iniciar el proceso de pago.')
    } finally {
      setCargando(false)
    }
  }

  const handleResultado = (data) => {
    setResultado(data)
    setVista('resultado')
  }

  if (vista === 'resultado' && resultado) {
    return <ResultadoPago resultado={resultado} onNuevoPago={() => { setResultado(null); setPlan(null); setPagoId(null); setVista('planes') }} />
  }

  if (vista === 'simulador' && pagoId) {
    return <SimuladorPago plan={planSeleccionado} pagoId={pagoId} onResultado={handleResultado} onVolver={() => setVista('planes')} />
  }

  return (
    <section className="card" aria-labelledby="titulo-pago">
      <h2 id="titulo-pago" style={{ marginBottom: '.5rem' }}>Elegir plan de membresía</h2>
      <p style={{ color: 'var(--color-muted)', fontSize: '.875rem', marginBottom: '1.5rem' }}>
        Selecciona el plan que mejor se adapte a ti
      </p>

      <div className="plan-grid" role="radiogroup" aria-label="Planes de membresía">
        {PLANES.map(plan => (
          <div
            key={plan.id}
            className={`plan-card${planSeleccionado?.id === plan.id ? ' selected' : ''}`}
            onClick={() => setPlan(plan)}
            role="radio"
            aria-checked={planSeleccionado?.id === plan.id}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setPlan(plan)}
          >
            {plan.badge && (
              <span style={{ position: 'absolute', top: '-10px', right: '12px', background: 'var(--color-primary)', color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '.2rem .6rem', borderRadius: '20px', letterSpacing: '.5px' }}>
                {plan.badge}
              </span>
            )}
            <span className="plan-name">{plan.label}</span>
            <span className="plan-price">${plan.precio.toLocaleString('es-CL')} CLP</span>
            <span style={{ fontSize: '.8rem', color: 'var(--color-muted)', display: 'block', marginTop: '.25rem' }}>{plan.desc}</span>
          </div>
        ))}
      </div>

      {error && <p className="alert alert-error" role="alert" style={{ marginTop: '1rem' }}>{error}</p>}

      <div className="btn-row" style={{ marginTop: '1.5rem' }}>
        <button className="btn btn-primary" onClick={handleIrAPagar} disabled={!planSeleccionado || cargando}>
          {cargando ? 'Preparando pago...' : 'Continuar al pago →'}
        </button>
      </div>
    </section>
  )
}
