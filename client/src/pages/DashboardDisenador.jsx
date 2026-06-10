import { useState, useEffect } from 'react'
import { useAuth }   from '../hooks/useAuth.js'
import axiosInstance from '../api/axiosInstance'
import PagoMembresia from '../components/membresia/PagoMembresia.jsx'
import CatalogoTutorias from '../components/tutorias/CatalogoTutorias.jsx'
import BuscadorTutorias from '../components/tutorias/BuscadorTutorias.jsx'

const TABS = [
  { id: 'catalogo',  label: 'Catálogo de tutorías' },
  { id: 'buscar',    label: 'Buscar tutorías' },
]

const PLAN_LABEL = { mensual: 'Plan Mensual', anual: 'Plan Anual', senior: 'Plan Senior' }

const ESTADO_CFG = {
  activa:        { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Activa' },
  vencida:       { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Vencida' },
  pendiente:     { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Pendiente' },
  sin_membresia: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', label: 'Sin membresía' },
}

function diasRestantes(fechaFin) {
  if (!fechaFin) return null
  const diff = new Date(fechaFin) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function TarjetaMembresia({ membresia, onGestionar }) {
  const estadoKey = membresia?.estado ?? 'sin_membresia'
  const cfg       = ESTADO_CFG[estadoKey] ?? ESTADO_CFG.sin_membresia
  const sinPlan   = estadoKey === 'sin_membresia'
  const dias      = estadoKey === 'activa' ? diasRestantes(membresia?.fechaFin) : null

  return (
    <div style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 46, height: 46, borderRadius: '12px', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.3rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
              {sinPlan ? 'Sin membresía activa' : (PLAN_LABEL[membresia.plan] || membresia.plan)}
            </span>
            <span style={{ background: cfg.color, color: '#fff', borderRadius: '20px', padding: '.15rem .65rem', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.3px' }}>
              {cfg.label}
            </span>
          </div>
          <p style={{ fontSize: '.82rem', color: 'var(--color-muted)', margin: 0 }}>
            {sinPlan && 'Adquiere una membresía para acceder al contenido completo.'}
            {estadoKey === 'activa' && membresia?.fechaFin && (
              <>
                Válida hasta{' '}
                <strong style={{ color: 'var(--color-text)' }}>
                  {new Date(membresia.fechaFin).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                </strong>
                {dias !== null && (
                  <> &nbsp;·&nbsp; <strong style={{ color: cfg.color }}>{dias} día{dias !== 1 ? 's' : ''} restante{dias !== 1 ? 's' : ''}</strong></>
                )}
              </>
            )}
            {estadoKey === 'vencida' && membresia?.fechaFin && (
              <>Venció el {new Date(membresia.fechaFin).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })} — Renueva tu plan</>
            )}
            {estadoKey === 'pendiente' && 'Pago en proceso de confirmación.'}
          </p>
        </div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={onGestionar}>
        {sinPlan || estadoKey === 'vencida' ? 'Adquirir membresía' : 'Gestionar membresía'}
      </button>
    </div>
  )
}

export default function DashboardDisenador() {
  const { usuario }               = useAuth()
  const [tab, setTab]             = useState('catalogo')
  const [membresia, setMembresia] = useState(undefined)

  const cargarMembresia = () => {
    axiosInstance.get('/membresia/estado')
      .then(({ data }) => setMembresia(data))
      .catch(() => setMembresia(null))
  }

  useEffect(() => { cargarMembresia() }, [])

  const handleTabChange = (id) => {
    if (tab === 'membresia' && id !== 'membresia') cargarMembresia()
    setTab(id)
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '.2rem', fontSize: '1.25rem', fontWeight: 800 }}>
            Bienvenido/a, {usuario?.nombre}
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '.875rem', margin: 0 }}>Panel del diseñador · CODICH</p>
        </div>
        <div style={{ width: 44, height: 44, background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
          {usuario?.nombre?.charAt(0)?.toUpperCase() || 'D'}
        </div>
      </div>

      {membresia !== undefined && (
        <TarjetaMembresia membresia={membresia} onGestionar={() => setTab('membresia')} />
      )}

      <nav style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '2px solid var(--color-border)', paddingBottom: '.5rem' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`btn ${tab === t.id ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => handleTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'catalogo'  && <CatalogoTutorias />}
      {tab === 'buscar'    && <BuscadorTutorias />}
      {tab === 'membresia' && <PagoMembresia />}
    </div>
  )
}
