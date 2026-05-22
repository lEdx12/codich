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
              <div key={t._id} className="tutoria-card">
                <h3>{t.titulo}</h3>
                <p className="desc">{t.descripcion.length > 100 ? t.descripcion.slice(0, 100) + '…' : t.descripcion}</p>
                <span className="badge badge-gray" style={{ alignSelf: 'start' }}>{t.categoria}</span>
                <div className="meta">
                  <strong>${t.precio.toLocaleString('es-CL')} CLP</strong>
                  <span>{t.cuposDisponibles} cupos</span>
                </div>
                <a href={`/tutorias/${t._id}`} className="btn btn-outline btn-sm" style={{ textAlign: 'center' }}>Ver detalle →</a>
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
