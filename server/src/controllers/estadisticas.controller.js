import Usuario     from '../models/Usuario.js'
import Membresia   from '../models/Membresia.js'
import Tutoria     from '../models/Tutoria.js'
import Inscripcion from '../models/Inscripcion.js'
import Pago        from '../models/Pago.js'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export const obtenerEstadisticas = async (_req, res) => {
  try {
    const ahora      = new Date()
    const inicioMes  = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const inicio6Mes = new Date(ahora.getFullYear(), ahora.getMonth() - 5, 1)

    const [
      totalDisenadores,
      totalInstructores,
      instructoresActivos,
      membresiasActivas,
      membresiasPorPlan,
      tutoriasActivas,
      totalInscripciones,
      pagosAprobados,
      ingresoMes,
      ingresosMensuales,
      topTutorias,
    ] = await Promise.all([
      Usuario.countDocuments({ rol: 'diseñador' }),
      Usuario.countDocuments({ rol: 'instructor' }),
      Usuario.countDocuments({ rol: 'instructor', estado: 'activo' }),
      Membresia.countDocuments({ estado: 'activa', fechaFin: { $gt: ahora } }),
      Membresia.aggregate([
        { $match: { estado: 'activa', fechaFin: { $gt: ahora } } },
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),
      Tutoria.countDocuments({ estado: 'activa' }),
      Inscripcion.countDocuments({ estado: 'activa' }),
      Pago.aggregate([
        { $match: { estado: 'aprobado' } },
        { $group: { _id: null, total: { $sum: '$monto' }, count: { $sum: 1 } } },
      ]),
      Pago.aggregate([
        { $match: { estado: 'aprobado', createdAt: { $gte: inicioMes } } },
        { $group: { _id: null, total: { $sum: '$monto' } } },
      ]),
      Pago.aggregate([
        { $match: { estado: 'aprobado', createdAt: { $gte: inicio6Mes } } },
        { $group: {
            _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            total: { $sum: '$monto' },
            count: { $sum: 1 },
        } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Tutoria.find({ estado: 'activa' })
        .sort({ cuposOcupados: -1 })
        .limit(5)
        .populate('instructor', 'nombre')
        .select('titulo cuposOcupados cuposTotal instructor')
        .lean(),
    ])

    // ── Distribución de planes ──
    const planes = { mensual: 0, anual: 0, senior: 0 }
    membresiasPorPlan.forEach(p => { if (p._id in planes) planes[p._id] = p.count })

    // ── Serie de ingresos últimos 6 meses (rellena huecos con 0) ──
    const mapaIngresos = {}
    ingresosMensuales.forEach(i => { mapaIngresos[`${i._id.year}-${i._id.month}`] = i.total })
    const serieIngresos = []
    for (let i = 5; i >= 0; i--) {
      const d   = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`
      serieIngresos.push({
        mes:   MESES[d.getMonth()],
        anio:  d.getFullYear(),
        total: mapaIngresos[key] || 0,
      })
    }

    res.json({
      usuarios: {
        disenadores:        totalDisenadores,
        instructores:       totalInstructores,
        instructoresActivos,
      },
      membresias: {
        activas: membresiasActivas,
        planes,
      },
      tutorias: {
        activas:       tutoriasActivas,
        inscripciones: totalInscripciones,
      },
      ingresos: {
        total:    pagosAprobados[0]?.total || 0,
        mesActual: ingresoMes[0]?.total || 0,
        pagosAprobados: pagosAprobados[0]?.count || 0,
        serie:    serieIngresos,
      },
      topTutorias,
    })
  } catch (err) {
    console.error('Error al obtener estadísticas:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}
