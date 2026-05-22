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
      concepto: 'membresía',
    })

    await Membresia.findOneAndUpdate(
      { usuario: usuarioId },
      { plan, estado: 'pendiente' },
      { upsert: true, new: true }
    )

    const urlPago = await pagoService.crearSesionPago({
      pagoId:        pago._id.toString(),
      monto:         pago.monto,
      concepto:      `Membresía CODICH — Plan ${plan}`,
      correoUsuario: req.usuario.correo,
    })

    res.json({ urlPago })
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

      const hoy = new Date()
      const fin = new Date(hoy)
      const membresia = await Membresia.findOne({ usuario: pago.usuario })
      if (membresia.plan === 'mensual') fin.setMonth(fin.getMonth() + 1)
      else fin.setFullYear(fin.getFullYear() + 1)

      await Membresia.findOneAndUpdate(
        { usuario: pago.usuario },
        { estado: 'activa', fechaInicio: hoy, fechaFin: fin }
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
