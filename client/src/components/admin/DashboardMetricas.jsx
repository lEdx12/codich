import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'

const fmtCLP = n => `$${Number(n || 0).toLocaleString('es-CL')}`

const PLAN_COLORS = { mensual: '#2d5986', anual: '#e8562a', senior: '#16a34a' }
const PLAN_LABELS = { mensual: 'Mensual', anual: 'Anual', senior: 'Senior' }

function KpiCard({ icon, label, value, sub, accent }) {
  return (
    <div className="kpi-card" style={{ borderLeftColor: accent }}>
      <div className="kpi-card__icon" style={{ background: `${accent}1a`, color: accent }}>{icon}</div>
      <div className="kpi-card__body">
        <span className="kpi-card__label">{label}</span>
        <span className="kpi-card__value">{value}</span>
        {sub && <span className="kpi-card__sub">{sub}</span>}
      </div>
    </div>
  )
}

function BarChartIngresos({ serie }) {
  const max = Math.max(...serie.map(s => s.total), 1)
  return (
    <div className="card chart-card">
      <h3 className="chart-card__title">Ingresos últimos 6 meses</h3>
      <div className="barchart">
        {serie.map((s, i) => {
          const h = s.total === 0 ? 2 : Math.max((s.total / max) * 100, 4)
          return (
            <div key={i} className="barchart__col">
              <div className="barchart__bar-wrap">
                <span className="barchart__tooltip">{fmtCLP(s.total)}</span>
                <div className="barchart__bar" style={{ height: `${h}%` }} />
              </div>
              <span className="barchart__label">{s.mes}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DonutPlanes({ planes }) {
  const entries = Object.entries(planes)
  const total   = entries.reduce((acc, [, v]) => acc + v, 0)
  const radio   = 54
  const circ    = 2 * Math.PI * radio
  let offset    = 0

  return (
    <div className="card chart-card">
      <h3 className="chart-card__title">Membresías por plan</h3>
      {total === 0 ? (
        <p style={{ color: 'var(--color-muted)', fontSize: '.875rem', textAlign: 'center', padding: '2rem 0' }}>
          Sin membresías activas todavía.
        </p>
      ) : (
        <div className="donut-wrap">
          <svg viewBox="0 0 140 140" className="donut">
            <circle cx="70" cy="70" r={radio} fill="none" stroke="#eef2f6" strokeWidth="18" />
            {entries.map(([plan, val]) => {
              if (val === 0) return null
              const frac = val / total
              const dash = frac * circ
              const seg  = (
                <circle
                  key={plan}
                  cx="70" cy="70" r={radio} fill="none"
                  stroke={PLAN_COLORS[plan]} strokeWidth="18"
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 70 70)"
                  strokeLinecap="butt"
                />
              )
              offset += dash
              return seg
            })}
            <text x="70" y="64" textAnchor="middle" className="donut__total">{total}</text>
            <text x="70" y="82" textAnchor="middle" className="donut__caption">activas</text>
          </svg>
          <ul className="donut-legend">
            {entries.map(([plan, val]) => (
              <li key={plan}>
                <span className="donut-legend__dot" style={{ background: PLAN_COLORS[plan] }} />
                <span className="donut-legend__label">{PLAN_LABELS[plan]}</span>
                <span className="donut-legend__val">{val}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function TopTutorias({ tutorias }) {
  return (
    <div className="card chart-card">
      <h3 className="chart-card__title">Tutorías más populares</h3>
      {(!tutorias || tutorias.length === 0) ? (
        <p style={{ color: 'var(--color-muted)', fontSize: '.875rem', textAlign: 'center', padding: '2rem 0' }}>
          Sin tutorías activas todavía.
        </p>
      ) : (
        <ul className="toplist">
          {tutorias.map((t, i) => {
            const pct = t.cuposTotal ? Math.round((t.cuposOcupados / t.cuposTotal) * 100) : 0
            return (
              <li key={t._id} className="toplist__item">
                <div className="toplist__head">
                  <span className="toplist__rank">{i + 1}</span>
                  <div className="toplist__info">
                    <span className="toplist__title">{t.titulo}</span>
                    <span className="toplist__sub">{t.instructor?.nombre || 'Sin instructor'}</span>
                  </div>
                  <span className="toplist__count">{t.cuposOcupados}/{t.cuposTotal}</span>
                </div>
                <div className="toplist__bar-track">
                  <div className="toplist__bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function DashboardMetricas() {
  const [stats, setStats]     = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    axiosInstance.get('/estadisticas')
      .then(({ data }) => setStats(data))
      .catch(() => setError('No se pudieron cargar las estadísticas.'))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <p aria-live="polite">Cargando métricas...</p>
  if (error)    return <p className="alert alert-error" role="alert">{error}</p>
  if (!stats)   return null

  return (
    <section aria-labelledby="titulo-metricas">
      <h2 id="titulo-metricas" style={{ marginBottom: '1.25rem' }}>Resumen de la plataforma</h2>

      <div className="kpi-grid">
        <KpiCard icon="$" label="Ingresos totales"  value={fmtCLP(stats.ingresos.total)}     sub={`${stats.ingresos.pagosAprobados} pagos aprobados`} accent="#16a34a" />
        <KpiCard icon="↑" label="Ingresos del mes"   value={fmtCLP(stats.ingresos.mesActual)} sub="Mes en curso"                                       accent="#e8562a" />
        <KpiCard icon="◆" label="Membresías activas" value={stats.membresias.activas}          sub="Suscripciones vigentes"                             accent="#2d5986" />
        <KpiCard icon="◇" label="Diseñadores"        value={stats.usuarios.disenadores}        sub="Usuarios registrados"                               accent="#1a3a5c" />
        <KpiCard icon="▤" label="Tutorías activas"   value={stats.tutorias.activas}            sub={`${stats.tutorias.inscripciones} inscripciones`}    accent="#7c3aed" />
        <KpiCard icon="◈" label="Instructores"       value={stats.usuarios.instructores}       sub={`${stats.usuarios.instructoresActivos} activos`}    accent="#0891b2" />
      </div>

      <div className="charts-grid">
        <BarChartIngresos serie={stats.ingresos.serie} />
        <DonutPlanes planes={stats.membresias.planes} />
      </div>

      <TopTutorias tutorias={stats.topTutorias} />
    </section>
  )
}
