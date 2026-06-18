import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'

function useDebounce(valor, delay = 400) {
  const [valorDebounced, setValorDebounced] = useState(valor)
  useEffect(() => {
    const timer = setTimeout(() => setValorDebounced(valor), delay)
    return () => clearTimeout(timer)
  }, [valor, delay])
  return valorDebounced
}

const CATEGORIAS = ['Diseño Industrial', 'Ergonomía', 'Materiales', 'Fabricación', 'Sustentabilidad']

export default function BuscadorTutorias() {
  const [busqueda, setBusqueda]         = useState('')
  const [categoria, setCategoria]       = useState('')
  const [resultados, setResultados]     = useState([])
  const [cargando, setCargando]         = useState(false)
  const [pagina, setPagina]             = useState(1)
  const [totalPags, setTotalPags]       = useState(1)
  const [sinResultados, setSinResultados] = useState(false)

  const textoBuscado = useDebounce(busqueda)

  useEffect(() => { setPagina(1) }, [textoBuscado, categoria])

  useEffect(() => { buscarTutorias() }, [textoBuscado, categoria, pagina])

  const buscarTutorias = async () => {
    setCargando(true)
    setSinResultados(false)
    try {
      const { data } = await axiosInstance.get('/tutorias/buscar', {
        params: { q: textoBuscado || undefined, categoria: categoria || undefined, pagina, limite: 20 },
      })
      setResultados(data.tutorias)
      setTotalPags(data.totalPaginas)
      setSinResultados(data.tutorias.length === 0)
    } catch {
      setResultados([])
    } finally {
      setCargando(false)
    }
  }

  return (
    <section aria-labelledby="titulo-buscador">
      <h2 id="titulo-buscador" style={{ marginBottom: '1.5rem' }}>Buscar tutorías</h2>

      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ flex: '1 1 240px', marginBottom: 0 }} role="search">
          <label htmlFor="busqueda">Buscar por nombre o descripción</label>
          <input
            id="busqueda" type="search" value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Ej: diseño de productos..."
            aria-label="Buscar tutorías"
          />
        </div>
        <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
          <label htmlFor="cat-filter">Categoría</label>
          <select id="cat-filter" value={categoria} onChange={e => setCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {cargando && <p aria-live="polite" style={{ color: 'var(--color-muted)' }}>Buscando tutorías...</p>}
      {!cargando && sinResultados && (
        <p role="status" style={{ color: 'var(--color-muted)' }}>Sin resultados. Intenta con otros términos.</p>
      )}

      {!cargando && resultados.length > 0 && (
        <>
          <div className="tutoria-grid">
            {resultados.map(t => (
              <div key={t._id} className="tutoria-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  height: 120,
                  background: t.imagen
                    ? `url(${t.imagen}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #1a2a1a 0%, #2c3e2c 60%, #1e3a2e 100%)',
                  position: 'relative',
                  flexShrink: 0,
                }}>
                  <span className="badge badge-gray" style={{ position: 'absolute', top: 8, left: 8, backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,.55)', color: '#fff', border: 'none' }}>{t.categoria}</span>
                  {t.cuposDisponibles === 0 && (
                    <span style={{ position: 'absolute', top: 8, right: 8, background: '#dc2626', color: '#fff', fontSize: '.68rem', fontWeight: 700, padding: '.2rem .5rem', borderRadius: '20px' }}>Sin cupos</span>
                  )}
                </div>
                <div style={{ padding: '.9rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                  <h3 style={{ fontSize: '.95rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{t.titulo}</h3>
                  <p className="desc" style={{ fontSize: '.8rem', color: 'var(--color-muted)', flex: 1, margin: 0 }}>
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
                </div>
              </div>
            ))}
          </div>

          <nav className="pagination" aria-label="Páginas de resultados">
            <button className="btn btn-outline btn-sm" onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>← Anterior</button>
            <span>Página {pagina} de {totalPags}</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPagina(p => p + 1)} disabled={pagina >= totalPags}>Siguiente →</button>
          </nav>
        </>
      )}
    </section>
  )
}
