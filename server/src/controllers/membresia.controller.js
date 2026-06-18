import Membresia    from '../models/Membresia.js'
import Pago          from '../models/Pago.js'
import pagoService   from '../services/pagoService.js'
import emailService  from '../services/emailService.js'

export const iniciarPago = async (req, res) => {
  const { plan } = req.body
  const usuarioId = req.usuario.id

  const planesValidos = ['mensual', 'anual', 'senior']
  if (!planesValidos.includes(plan))
    return res.status(400).json({ mensaje: 'Plan no válido.' })

  try {
    const montoPorPlan = { mensual: 9990, anual: 89990, senior: 59990 }
    const pago = await Pago.create({
      usuario:  usuarioId,
      monto:    montoPorPlan[plan],
      estado:   'pendiente',
      concepto: `membresia:${plan}`,
    })

    const urlPago = await pagoService.crearSesionPago({
      pagoId:        pago._id.toString(),
      monto:         pago.monto,
      concepto:      `Membresía CODICH — Plan ${plan}`,
      correoUsuario: req.usuario.correo,
    })

    res.json({ urlPago, pagoId: pago._id })
  } catch (err) {
    console.error('Error al iniciar pago:', err)
    res.status(500).json({ mensaje: 'Error al iniciar el proceso de pago. Intenta más tarde.' })
  }
}

export const webhookPago = async (req, res) => {
  const { token } = req.body
  try {
    const resultado = await pagoService.verificarPago(token)
    const pago      = await Pago.findById(resultado.comercioOrden)
    if (!pago) return res.status(404).json({ mensaje: 'Pago no encontrado.' })

    if (resultado.status === 2) {
      pago.estado        = 'aprobado'
      pago.idTransaccion = resultado.flowOrder
      await pago.save()

      const planPago = pago.concepto?.startsWith('membresia:') ? pago.concepto.split(':')[1] : 'mensual'
      const membresiaExistente = await Membresia.findOne({ usuario: pago.usuario })
      const hoy = new Date()
      const base = (membresiaExistente?.estado === 'activa' && membresiaExistente.fechaFin > hoy)
        ? new Date(membresiaExistente.fechaFin)
        : new Date(hoy)
      const fin = new Date(base)
      if (planPago === 'mensual') fin.setMonth(fin.getMonth() + 1)
      else fin.setFullYear(fin.getFullYear() + 1)

      await Membresia.findOneAndUpdate(
        { usuario: pago.usuario },
        { plan: planPago, estado: 'activa', fechaInicio: membresiaExistente?.fechaInicio || hoy, fechaFin: fin },
        { upsert: true }
      )

      emailService.enviarComprobante({ usuarioId: pago.usuario, pago }).catch(console.error)
    } else {
      pago.estado = 'rechazado'
      await pago.save()
    }

    res.json({ ok: true })
  } catch (err) {
    console.error('Error en webhook de pago:', err)
    res.status(500).json({ mensaje: 'Error al procesar la respuesta de la pasarela.' })
  }
}

export const simularPago = async (req, res) => {
  const { pagoId, aprobado } = req.body
  if (!pagoId) return res.status(400).json({ mensaje: 'pagoId es requerido.' })

  try {
    const pago = await Pago.findById(pagoId)
    if (!pago) return res.status(404).json({ mensaje: 'Pago no encontrado.' })
    if (pago.usuario.toString() !== req.usuario.id)
      return res.status(403).json({ mensaje: 'No autorizado.' })
    if (pago.estado !== 'pendiente')
      return res.status(409).json({ mensaje: 'Este pago ya fue procesado.' })

    if (aprobado) {
      pago.estado        = 'aprobado'
      pago.idTransaccion = `MOCK-${Date.now()}`
      await pago.save()

      const planPago = pago.concepto?.startsWith('membresia:') ? pago.concepto.split(':')[1] : 'mensual'
      const membresiaExistente = await Membresia.findOne({ usuario: pago.usuario })
      const hoy = new Date()
      const base = (membresiaExistente?.estado === 'activa' && membresiaExistente.fechaFin > hoy)
        ? new Date(membresiaExistente.fechaFin)
        : new Date(hoy)
      const fin = new Date(base)
      if (planPago === 'mensual') fin.setMonth(fin.getMonth() + 1)
      else fin.setFullYear(fin.getFullYear() + 1)

      const membresiaActual = await Membresia.findOneAndUpdate(
        { usuario: pago.usuario },
        { plan: planPago, estado: 'activa', fechaInicio: membresiaExistente?.fechaInicio || hoy, fechaFin: fin },
        { upsert: true, new: true }
      )

      emailService.enviarComprobante({ usuarioId: pago.usuario, pago }).catch(console.error)

      return res.json({
        aprobado:    true,
        mensaje:     '¡Pago aprobado! Tu membresía está activa.',
        transaccion: pago.idTransaccion,
        membresia:   membresiaActual,
      })
    }

    pago.estado = 'rechazado'
    await pago.save()
    return res.json({
      aprobado: false,
      mensaje:  'Pago rechazado. No se realizó ningún cobro.',
    })
  } catch (err) {
    console.error('Error en simulación de pago:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const obtenerEstado = async (req, res) => {
  try {
    const membresia = await Membresia.findOne({ usuario: req.usuario.id })
    if (!membresia)
      return res.json({ estado: 'sin_membresia', mensaje: 'No tienes membresía activa.' })
    res.json(membresia)
  } catch (err) {
    console.error('Error al obtener estado membresía:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}
