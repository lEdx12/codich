import { useState } from 'react'
import axiosInstance from '../../api/axiosInstance'

const TIPOS_INFORME = [
  { id: 'ingresos', label: 'Ingresos por período' },
  { id: 'miembros', label: 'Miembros registrados' },
  { id: 'tutorias', label: 'Tutorías activas e inscritos' },
]

export default function GeneradorInformes() {
  const [tipo, setTipo]         = useState('')
  const [periodo, setPeriodo]   = useState('')
  const [formato, setFormato]   = useState('pdf')
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState('')
  const [generado, setGenerado] = useState(false)

  const handleGenerar = async () => {
    if (!tipo || !periodo) { setError('Selecciona el tipo de informe y el período.'); return }
    setCargando(true)
    setError('')
    setGenerado(false)
    try {
      const response = await axiosInstance.get('/informes/generar', {
        params: { tipo, periodo, formato },
        responseType: 'blob',
      })
      const mimeType = formato === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;'
      const blob = new Blob([response.data], { type: mimeType })
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href  = url
      link.download = `informe_codich_${tipo}_${periodo}.${formato}`
      link.click()
      URL.revokeObjectURL(url)
      setGenerado(true)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al generar el informe.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="card" aria-labelledby="titulo-informes">
      <h2 id="titulo-informes" style={{ marginBottom: '1.5rem' }}>Generar informe</h2>

      {error   && <p className="alert alert-error"   role="alert">{error}</p>}
      {generado && <p className="alert alert-success" role="status">✅ Informe descargado correctamente.</p>}

      <div style={{ display: 'grid', gap: '1rem', maxWidth: 520 }}>
        <div className="form-group">
          <label htmlFor="tipo-informe">Tipo de informe</label>
          <select id="tipo-informe" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">-- Seleccionar --</option>
            {TIPOS_INFORME.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="periodo">Período</label>
          <input id="periodo" type="month" value={periodo} onChange={e => setPeriodo(e.target.value)} />
        </div>

        <fieldset style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '.75rem 1rem' }}>
          <legend style={{ padding: '0 .5rem', fontWeight: 700, fontSize: '.9rem' }}>Formato de exportación</legend>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '.5rem' }}>
            {['pdf', 'csv'].map(f => (
              <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', cursor: 'pointer' }}>
                <input type="radio" name="formato" value={f} checked={formato === f} onChange={() => setFormato(f)} />
                {f.toUpperCase()}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" onClick={handleGenerar} disabled={cargando}>
          {cargando ? 'Generando...' : 'Generar y descargar'}
        </button>
      </div>
    </section>
  )
}
