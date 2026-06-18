import { useState, useEffect } from 'react'
import { useAuth }      from '../hooks/useAuth.js'
import axiosInstance    from '../api/axiosInstance'
import PagoMembresia    from '../components/membresia/PagoMembresia.jsx'
import CatalogoTutorias from '../components/tutorias/CatalogoTutorias.jsx'
import BuscadorTutorias from '../components/tutorias/BuscadorTutorias.jsx'
import MisTutorias      from '../components/tutorias/MisTutorias.jsx'

const NAV = [
  { id: 'resumen',   label: 'Resumen',           icon: '▦' },
  { id: 'catalogo',  label: 'Catálogo',           icon: '▤' },
  { id: 'buscar',    label: 'Buscar tutorías',    icon: '⌕' },
  { id: 'inscritas', label: 'Mis tutorías',       icon: '✓' },
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

function ResumenDisenador({ usuario, membresia, onGestionar }) {
  const estadoKey = membresia?.estado ?? 'sin_membresia'
  const cfg       = ESTADO_CFG[estadoKey] ?? ESTADO_CFG.sin_membresia
  const sinPlan   = estadoKey === 'sin_membresia'
  const dias      = estadoKey === 'activa' ? diasRestantes(membresia?.fechaFin) : null

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Resumen</h2>

      <div style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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

      <div className="card">
        <p style={{ color: 'var(--color-muted)', fontSize: '.9rem', margin: 0 }}>
          Usa el menú lateral para explorar el catálogo, buscar tutorías o revisar tus inscripciones.
        </p>
      </div>
    </div>
  )
}

export default function DashboardDisenador() {
  const { usuario }               = useAuth()
  const [seccion, setSeccion]     = useState('resumen')
  const [membresia, setMembresia] = useState(undefined)

  const cargarMembresia = () => {
    axiosInstance.get('/membresia/estado')
      .then(({ data }) => setMembresia(data))
      .catch(() => setMembresia(null))
  }

  useEffect(() => { cargarMembresia() }, [])

  const handleNav = (id) => {
    if (seccion === 'membresia' && id !== 'membresia') cargarMembresia()
    setSeccion(id)
  }

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 210, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
            {usuario?.nombre?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuario?.nombre}</div>
            <div style={{ fontSize: '.75rem', color: 'var(--color-muted)' }}>Diseñador</div>
          </div>
        </div>

        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '.65rem',
              padding: '.6rem .85rem', borderRadius: 'var(--radius)',
              border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
              fontWeight: seccion === item.id ? 700 : 400,
              fontSize: '.875rem',
              background: seccion === item.id ? 'var(--color-primary)' : 'transparent',
              color: seccion === item.id ? '#fff' : 'var(--color-text)',
              transition: 'background .15s, color .15s',
            }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '.5rem', paddingTop: '.5rem' }}>
          <button
            onClick={() => handleNav('membresia')}
            style={{
              display: 'flex', alignItems: 'center', gap: '.65rem',
              padding: '.6rem .85rem', borderRadius: 'var(--radius)',
              border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
              fontWeight: seccion === 'membresia' ? 700 : 400,
              fontSize: '.875rem',
              background: seccion === 'membresia' ? 'var(--color-primary)' : 'transparent',
              color: seccion === 'membresia' ? '#fff' : 'var(--color-text)',
              transition: 'background .15s, color .15s',
            }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>◈</span>
            Membresía
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {seccion === 'resumen'   && membresia !== undefined && (
          <ResumenDisenador usuario={usuario} membresia={membresia} onGestionar={() => handleNav('membresia')} />
        )}
        {seccion === 'catalogo'  && <CatalogoTutorias />}
        {seccion === 'buscar'    && <BuscadorTutorias />}
        {seccion === 'inscritas' && <MisTutorias />}
        {seccion === 'membresia' && <PagoMembresia />}
      </main>

    </div>
  )
}
