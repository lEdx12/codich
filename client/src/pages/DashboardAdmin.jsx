import { useState } from 'react'
import { useAuth }   from '../hooks/useAuth.js'
import DashboardMetricas   from '../components/admin/DashboardMetricas.jsx'
import GestionInstructores from '../components/admin/GestionInstructores.jsx'
import GeneradorInformes   from '../components/admin/GeneradorInformes.jsx'
import ListaDisenadores    from '../components/admin/ListaDisenadores.jsx'

const NAV = [
  { id: 'resumen',      label: 'Resumen',      icon: '▦' },
  { id: 'instructores', label: 'Instructores', icon: '◈' },
  { id: 'disenadores',  label: 'Diseñadores',  icon: '◇' },
  { id: 'informes',     label: 'Informes',     icon: '▤' },
]

export default function DashboardAdmin() {
  const { usuario }   = useAuth()
  const [tab, setTab] = useState('resumen')

  const activo = NAV.find(n => n.id === tab)

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__head">
          <span className="admin-sidebar__title">Administración</span>
          <span className="admin-sidebar__user">{usuario?.nombre}</span>
        </div>
        <nav className="admin-sidebar__nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`admin-navitem ${tab === n.id ? 'is-active' : ''}`}
              onClick={() => setTab(n.id)}
            >
              <span className="admin-navitem__icon" aria-hidden="true">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin-content">
        <header className="admin-content__header">
          <h1 className="admin-content__title">{activo?.label}</h1>
          <p className="admin-content__crumb">Panel CODICH · {activo?.label}</p>
        </header>

        {tab === 'resumen'      && <DashboardMetricas />}
        {tab === 'instructores' && <GestionInstructores />}
        {tab === 'disenadores'  && <ListaDisenadores />}
        {tab === 'informes'     && <GeneradorInformes />}
      </div>
    </div>
  )
}
