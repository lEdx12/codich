import informeService from '../services/informeService.js'

export const generarInforme = async (req, res) => {
  const { tipo, periodo, formato = 'pdf' } = req.query

  if (!tipo || !periodo)
    return res.status(400).json({ mensaje: 'Tipo y período son requeridos.' })

  const tiposValidos   = ['ingresos', 'miembros', 'tutorias']
  const formatosValidos = ['pdf', 'csv']
  if (!tiposValidos.includes(tipo))
    return res.status(400).json({ mensaje: 'Tipo de informe no válido.' })
  if (!formatosValidos.includes(formato))
    return res.status(400).json({ mensaje: 'Formato no válido. Usa pdf o csv.' })

  try {
    const { buffer, mime } = await informeService.generarInforme(tipo, periodo, formato)
    const ext = formato
    res.setHeader('Content-Type', mime)
    res.setHeader('Content-Disposition', `attachment; filename="informe_codich_${tipo}_${periodo}.${ext}"`)
    res.send(buffer)
  } catch (err) {
    console.error('Error al generar informe:', err)
    res.status(500).json({ mensaje: 'Error al generar el informe.' })
  }
}
