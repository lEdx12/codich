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
    const usuarios = await Usuario.find({ createdAt: rango, rol: 'diseñador' }).lean()
    return usuarios.map(u => ({
      nombre:          u.nombre,
      correo:          u.correo,
      estado:          u.estado,
      fecha_registro:  new Date(u.createdAt).toLocaleDateString('es-CL'),
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

const LABEL_MAPA = {
  nombre: 'Nombre', correo: 'Correo', estado: 'Estado', rol: 'Rol',
  fecha_registro: 'Fecha de registro', monto: 'Monto (CLP)', fecha: 'Fecha',
  usuario: 'Usuario', concepto: 'Concepto', transaccion: 'N° Transacción',
  titulo: 'Título', instructor: 'Instructor', categoria: 'Categoría',
  precio: 'Precio (CLP)', cupos_total: 'Cupos totales', inscritos: 'Inscritos',
}

export const generarPDF = (tipo, periodo, datos) =>
  new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50 })
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.font('Helvetica-Bold').fontSize(20).text('CODICH', { align: 'center' })
    doc.font('Helvetica').fontSize(13).text(`Informe de ${tipo === 'miembros' ? 'Diseñadores Registrados' : tipo === 'ingresos' ? 'Ingresos' : 'Tutorías'}`, { align: 'center' })
    doc.fontSize(11).text(`Período: ${periodo}`, { align: 'center' })
    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(2).stroke()
    doc.moveDown()

    if (datos.length === 0) {
      doc.fontSize(11).text('Sin datos para el período seleccionado.')
    } else {
      datos.forEach((row, idx) => {
        if (idx > 0) {
          doc.moveDown(0.3)
          doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).dash(4, { space: 3 }).stroke()
          doc.undash().moveDown(0.3)
        }
        doc.font('Helvetica-Bold').fontSize(10).text(`Registro ${idx + 1}`, { underline: true })
        doc.moveDown(0.2)
        Object.entries(row).forEach(([key, val]) => {
          const label = LABEL_MAPA[key] || key
          doc.fontSize(10)
            .font('Helvetica-Bold').text(`${label}: `, { continued: true })
            .font('Helvetica').text(String(val ?? '—'))
        })
      })
    }

    doc.moveDown(2)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).stroke()
    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(9).fillColor('gray')
      .text(`Generado el ${new Date().toLocaleDateString('es-CL')} — CODICH Plataforma`, { align: 'center' })

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
