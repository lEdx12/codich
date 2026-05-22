import PDFDocument from 'pdfkit'
import { Parser }  from 'json2csv'
import Pago        from '../models/Pago.js'
import Usuario     from '../models/Usuario.js'
import Tutoria     from '../models/Tutoria.js'
import Inscripcion from '../models/Inscripcion.js'

async function obtenerDatos(tipo, periodo) {
  const [anio, mes] = periodo.split('-').map(Number)
  const inicio = new Date(anio, mes - 1, 1)
  const fin    = new Date(anio, mes, 1)
  const rango  = { $gte: inicio, $lt: fin }

  if (tipo === 'ingresos') {
    const pagos = await Pago.find({ createdAt: rango, estado: 'aprobado' })
      .populate('usuario', 'nombre correo')
      .lean()
    return pagos.map(p => ({
      fecha: new Date(p.createdAt).toLocaleDateString('es-CL'),
      usuario: p.usuario?.nombre || 'N/A',
      correo:  p.usuario?.correo || 'N/A',
      monto:   p.monto,
      concepto: p.concepto,
      transaccion: p.idTransaccion || 'N/A',
    }))
  }

  if (tipo === 'miembros') {
    const usuarios = await Usuario.find({ createdAt: rango }).lean()
    return usuarios.map(u => ({
      nombre: u.nombre,
      correo: u.correo,
      rol:    u.rol,
      estado: u.estado,
      fecha_registro: new Date(u.createdAt).toLocaleDateString('es-CL'),
    }))
  }

  if (tipo === 'tutorias') {
    const tutorias = await Tutoria.find().populate('instructor', 'nombre').lean()
    const result = []
    for (const t of tutorias) {
      const inscritos = await Inscripcion.countDocuments({ tutoria: t._id, estado: 'activa' })
      result.push({
        titulo:     t.titulo,
        instructor: t.instructor?.nombre || 'N/A',
        categoria:  t.categoria,
        estado:     t.estado,
        precio:     t.precio,
        cupos_total: t.cuposTotal,
        inscritos,
      })
    }
    return result
  }

  return []
}

export const generarPDF = (tipo, periodo, datos) =>
  new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50 })
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(18).text(`Informe CODICH — ${tipo.toUpperCase()}`, { align: 'center' })
    doc.fontSize(12).text(`Período: ${periodo}`, { align: 'center' })
    doc.moveDown()

    if (datos.length === 0) {
      doc.text('Sin datos para el período seleccionado.')
    } else {
      const campos = Object.keys(datos[0])
      doc.fontSize(10).text(campos.join(' | '), { underline: true })
      doc.moveDown(0.3)
      datos.forEach(row => {
        doc.text(Object.values(row).join(' | '))
      })
    }

    doc.end()
  })

export const generarCSV = (datos) => {
  if (datos.length === 0) return ''
  const parser = new Parser({ fields: Object.keys(datos[0]) })
  return parser.parse(datos)
}

export const generarInforme = async (tipo, periodo, formato) => {
  const datos = await obtenerDatos(tipo, periodo)
  if (formato === 'csv') {
    return { buffer: Buffer.from(generarCSV(datos), 'utf-8'), mime: 'text/csv' }
  }
  const buffer = await generarPDF(tipo, periodo, datos)
  return { buffer, mime: 'application/pdf' }
}

export default { generarInforme }
