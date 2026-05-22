import { useState } from 'react'
import { useAuth }   from '../hooks/useAuth.js'
import PagoMembresia from '../components/membresia/PagoMembresia.jsx'
import CatalogoTutorias from '../components/tutorias/CatalogoTutorias.jsx'
import BuscadorTutorias from '../components/tutorias/BuscadorTutorias.jsx'

const TABS = [
  { id: 'catalogo',  label: 'Catálogo de tutorías' },
  { id: 'buscar',    label: 'Buscar tutorías' },
  { id: 'membresia', label: 'Mi membresía' },
]

export default function DashboardDisenador() {
  const { usuario } = useAuth()
  const [tab, setTab] = useState('catalogo')

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <h2 style={{ marginBottom: '.25rem' }}>Bienvenido/a, {usuario?.nombre}</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '.875rem' }}>Panel del diseñador</p>
      </div>

      <nav style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`btn ${tab === t.id ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setTab(t.id)}
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
