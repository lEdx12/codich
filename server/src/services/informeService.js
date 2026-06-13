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

const COLORS = {
  primary:     '#1a3a5c',
  primaryDark: '#0f2540',
  accentSoft:  '#ffa07a',
  rowAlt:      '#f1f5f9',
  border:      '#e2e8f0',
  text:        '#1e2a3a',
  muted:       '#94a3b8',
  summaryBg:   '#eef2f6',
}

const TITULO_MAPA = {
  ingresos: 'Informe de Ingresos',
  miembros: 'Informe de Diseñadores Registrados',
  tutorias: 'Informe de Tutorías',
}

const COL_WEIGHTS = {
  nombre: 2, titulo: 2.2, usuario: 1.8, correo: 2.2,
  instructor: 1.6, concepto: 1.8, transaccion: 1.6,
}

const fmtMonto = v => `$${Number(v || 0).toLocaleString('es-CL')}`

const formatVal = (key, val) => {
  if (val === null || val === undefined || val === '') return '—'
  if (key === 'monto' || key === 'precio') return fmtMonto(val)
  return String(val)
}

function dibujarPie(doc) {
  const range = doc.bufferedPageRange()
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i)
    const left   = doc.page.margins.left
    const right  = doc.page.width - doc.page.margins.right
    const bottom = doc.page.height - 32
    doc.moveTo(left, bottom).lineTo(right, bottom).lineWidth(0.5).strokeColor(COLORS.border).stroke()
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8)
      .text('CODICH — Plataforma de Diseño', left, bottom + 6, { lineBreak: false })
      .text(`Página ${i + 1} de ${range.count}`, left, bottom + 6, { width: right - left, align: 'right', lineBreak: false })
  }
}

export const generarPDF = (tipo, periodo, datos) =>
  new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true })
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pageW  = doc.page.width
    const left   = doc.page.margins.left
    const right  = pageW - doc.page.margins.right
    const usable = right - left

    // ── Banda de cabecera con marca ──
    doc.rect(0, 0, pageW, 92).fill(COLORS.primary)
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24).text('CODICH', left, 26)
    doc.fillColor(COLORS.accentSoft).font('Helvetica-Bold').fontSize(8)
      .text('PLATAFORMA DE DISEÑO', left, 56, { characterSpacing: 1 })
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(14)
      .text(TITULO_MAPA[tipo] || 'Informe', left, 30, { width: usable, align: 'right' })
    doc.font('Helvetica').fontSize(9).fillColor('#cdd9e5')
      .text(`Período: ${periodo}`, left, 50, { width: usable, align: 'right' })
      .text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, left, 63, { width: usable, align: 'right' })

    // ── Sin datos ──
    if (!datos || datos.length === 0) {
      doc.fillColor(COLORS.muted).font('Helvetica').fontSize(12)
        .text('Sin datos para el período seleccionado.', left, 130, { width: usable, align: 'center' })
      dibujarPie(doc)
      doc.end()
      return
    }

    // ── Columnas dinámicas ──
    const keys      = Object.keys(datos[0])
    const weights   = keys.map(k => COL_WEIGHTS[k] || 1)
    const totalW    = weights.reduce((a, b) => a + b, 0)
    const colWidths = weights.map(w => (w / totalW) * usable)
    const colX      = []
    let acc = left
    colWidths.forEach(w => { colX.push(acc); acc += w })

    const PAD        = 5
    const headerH    = 24
    const fontSize   = 8
    const pageBottom = doc.page.height - doc.page.margins.bottom - 40

    const dibujarEncabezadoTabla = (y) => {
      doc.rect(left, y, usable, headerH).fill(COLORS.primaryDark)
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(fontSize)
      keys.forEach((k, i) => {
        doc.text(LABEL_MAPA[k] || k, colX[i] + PAD, y + 8,
          { width: colWidths[i] - PAD * 2, lineBreak: false, ellipsis: true })
      })
      return y + headerH
    }

    let y = dibujarEncabezadoTabla(110)

    datos.forEach((row, idx) => {
      doc.font('Helvetica').fontSize(fontSize)
      let rowH = 16
      keys.forEach((k, i) => {
        const h = doc.heightOfString(formatVal(k, row[k]), { width: colWidths[i] - PAD * 2 })
        rowH = Math.max(rowH, h + 8)
      })

      if (y + rowH > pageBottom) {
        doc.addPage()
        y = dibujarEncabezadoTabla(doc.page.margins.top)
      }

      if (idx % 2 === 1) doc.rect(left, y, usable, rowH).fill(COLORS.rowAlt)

      doc.fillColor(COLORS.text).font('Helvetica').fontSize(fontSize)
      keys.forEach((k, i) => {
        doc.text(formatVal(k, row[k]), colX[i] + PAD, y + 4, { width: colWidths[i] - PAD * 2 })
      })
      doc.moveTo(left, y + rowH).lineTo(right, y + rowH).lineWidth(0.5).strokeColor(COLORS.border).stroke()
      y += rowH
    })

    // ── Resumen ──
    y += 14
    if (y + 30 > pageBottom) { doc.addPage(); y = doc.page.margins.top }
    doc.rect(left, y, usable, 28).fill(COLORS.summaryBg)
    doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(10)
      .text(`Total de registros: ${datos.length}`, left + PAD, y + 9, { lineBreak: false })
    if (tipo === 'ingresos') {
      const total = datos.reduce((a, r) => a + (Number(r.monto) || 0), 0)
      doc.text(`Ingresos totales: ${fmtMonto(total)}`, left, y + 9,
        { width: usable - PAD, align: 'right', lineBreak: false })
    }

    dibujarPie(doc)
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
