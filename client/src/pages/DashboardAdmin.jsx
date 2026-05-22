import { useState } from 'react'
import { useAuth }   from '../hooks/useAuth.js'
import GestionInstructores from '../components/admin/GestionInstructores.jsx'
import GeneradorInformes   from '../components/admin/GeneradorInformes.jsx'

const TABS = [
  { id: 'instructores', label: 'Gestión de instructores' },
  { id: 'informes',     label: 'Generar informes' },
]

export default function DashboardAdmin() {
  const { usuario } = useAuth()
  const [tab, setTab] = useState('instructores')

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <h2 style={{ marginBottom: '.25rem' }}>Panel de administración</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '.875rem' }}>Bienvenido/a, {usuario?.nombre}</p>
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

      {tab === 'instructores' && <GestionInstructores />}
      {tab === 'informes'     && <GeneradorInformes />}
    </div>
  )
}
