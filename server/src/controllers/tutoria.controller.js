import Tutoria    from '../models/Tutoria.js'
import Inscripcion  from '../models/Inscripcion.js'
import Pago         from '../models/Pago.js'
import Membresia    from '../models/Membresia.js'
import pagoService  from '../services/pagoService.js'

export const listarTutorias = async (req, res) => {
  const { pagina = 1, limite = 20, instructor } = req.query
  const skip   = (parseInt(pagina) - 1) * parseInt(limite)
  // Un instructor solo puede ver sus propias tutorías, sin importar el query param.
  const filtro = req.usuario?.rol === 'instructor'
    ? { instructor: req.usuario.id }
    : (instructor ? { instructor } : { estado: 'activa' })
  try {
    const [tutorias, total] = await Promise.all([
      Tutoria.find(filtro)
        .populate('instructor', 'nombre especialidad')
        .skip(skip).limit(parseInt(limite))
        .lean(),
      Tutoria.countDocuments(filtro),
    ])
    // Para diseñadores, marcar qué tutorías ya tienen inscripción activa
    let inscritasSet = new Set()
    if (req.usuario?.rol === 'diseñador') {
      const insc = await Inscripcion.find({ usuario: req.usuario.id, estado: 'activa' }).select('tutoria').lean()
      inscritasSet = new Set(insc.map(i => i.tutoria.toString()))
    }

    const resultado = tutorias.map(t => ({
      ...t,
      cuposDisponibles: (t.cuposTotal || 0) - (t.cuposOcupados || 0),
      inscrito: inscritasSet.has(t._id.toString()),
    }))
    res.json({ tutorias: resultado, totalPaginas: Math.ceil(total / parseInt(limite)) || 1, pagina: parseInt(pagina) })
  } catch (err) {
    console.error('Error al listar tutorías:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const crearTutoria = async (req, res) => {
  const { titulo, descripcion, cuposTotal, categoria, imagen } = req.body
  if (!titulo || !descripcion || !cuposTotal || !categoria)
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' })
  try {
    const tutoria = await Tutoria.create({
      instructor:  req.usuario.id,
      titulo,
      descripcion,
      cuposTotal:  Number(cuposTotal),
      categoria,
      imagen:      imagen || '',
      estado:      'activa',
    })
    res.status(201).json({ mensaje: 'Tutoría creada.', tutoria })
  } catch (err) {
    console.error('Error al crear tutoría:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const misInscripciones = async (req, res) => {
  try {
    const inscripciones = await Inscripcion.find({ usuario: req.usuario.id, estado: 'activa' })
      .populate({
        path: 'tutoria',
        populate: { path: 'instructor', select: 'nombre especialidad' },
      })
      .sort({ createdAt: -1 })
      .lean()

    const tutorias = inscripciones
      .filter(i => i.tutoria)
      .map(i => ({
        ...i.tutoria,
        cuposDisponibles: (i.tutoria.cuposTotal || 0) - (i.tutoria.cuposOcupados || 0),
        inscrito: true,
        fechaInscripcion: i.createdAt,
      }))

    res.json({ tutorias })
  } catch (err) {
    console.error('Error al listar inscripciones:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const buscarTutorias = async (req, res) => {
  const { q, categoria, pagina = 1, limite = 20 } = req.query
  const skip = (parseInt(pagina) - 1) * parseInt(limite)
  const filtro = { estado: 'activa' }
  if (q) filtro.$or = [
    { titulo:      { $regex: q, $options: 'i' } },
    { descripcion: { $regex: q, $options: 'i' } },
  ]
  if (categoria) filtro.categoria = categoria
  try {
    const [tutorias, total] = await Promise.all([
      Tutoria.find(filtro)
        .populate('instructor', 'nombre')
        .skip(skip).limit(parseInt(limite))
        .lean({ virtuals: true }),
      Tutoria.countDocuments(filtro),
    ])
    res.json({ tutorias, totalPaginas: Math.ceil(total / parseInt(limite)) || 1, pagina: parseInt(pagina) })
  } catch (err) {
    console.error('Error al buscar tutorías:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const detalleTutoria = async (req, res) => {
  try {
    const tutoria = await Tutoria.findById(req.params.id)
      .populate('instructor', 'nombre especialidad')
      .populate('materiales')
      .lean({ virtuals: true })
    if (!tutoria) return res.status(404).json({ mensaje: 'Tutoría no encontrada.' })
    res.json(tutoria)
  } catch (err) {
    console.error('Error al obtener tutoría:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const contratarTutoria = async (req, res) => {
  const { tutoriaId } = req.body
  const usuarioId     = req.usuario.id
  try {
    const tutoria = await Tutoria.findById(tutoriaId)
    if (!tutoria || tutoria.estado !== 'activa')
      return res.status(404).json({ mensaje: 'Tutoría no disponible.' })
    if (tutoria.cuposOcupados >= tutoria.cuposTotal)
      return res.status(409).json({ mensaje: 'No hay cupos disponibles.' })

    const yaInscrito = await Inscripcion.findOne({ usuario: usuarioId, tutoria: tutoriaId, estado: 'activa' })
    if (yaInscrito)
      return res.status(409).json({ mensaje: 'Ya estás inscrito en esta tutoría.' })

    const membresia = await Membresia.findOne({ usuario: usuarioId })
    const tieneMembresia = membresia?.estado === 'activa' && membresia?.fechaFin && membresia.fechaFin > new Date()

    if (tieneMembresia) {
      await Inscripcion.create({ usuario: usuarioId, tutoria: tutoriaId, estado: 'activa' })
      await Tutoria.findByIdAndUpdate(tutoriaId, { $inc: { cuposOcupados: 1 } })
      return res.json({ inscrito: true, mensaje: '¡Inscrito exitosamente! Tu membresía activa te da acceso a esta tutoría.' })
    }

    const pago = await Pago.create({
      usuario:  usuarioId,
      monto:    tutoria.precio,
      estado:   'pendiente',
      concepto: 'tutoría',
    })

    const urlPago = await pagoService.crearSesionPago({
      pagoId:        pago._id.toString(),
      monto:         pago.monto,
      concepto:      `Tutoría CODICH — ${tutoria.titulo}`,
      correoUsuario: req.usuario.correo,
    })

    res.json({ urlPago, pagoId: pago._id, tutoria: { titulo: tutoria.titulo, precio: tutoria.precio } })
  } catch (err) {
    console.error('Error al contratar tutoría:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const simularPagoTutoria = async (req, res) => {
  const { pagoId, aprobado } = req.body
  const tutoriaId = req.params.id
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
      await Inscripcion.create({ usuario: pago.usuario, tutoria: tutoriaId, estado: 'activa' })
      await Tutoria.findByIdAndUpdate(tutoriaId, { $inc: { cuposOcupados: 1 } })
      return res.json({ aprobado: true, mensaje: '¡Pago aprobado! Estás inscrito en la tutoría.', transaccion: pago.idTransaccion })
    }

    pago.estado = 'rechazado'
    await pago.save()
    return res.json({ aprobado: false, mensaje: 'Pago rechazado. No se realizó ningún cobro.' })
  } catch (err) {
    console.error('Error al simular pago tutoría:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const editarTutoria = async (req, res) => {
  const { id } = req.params
  const { titulo, descripcion, precio, cuposTotal, estado, categoria, imagen } = req.body
  try {
    const tutoria = await Tutoria.findOneAndUpdate(
      { _id: id, instructor: req.usuario.id },
      { titulo, descripcion, precio, cuposTotal, estado, categoria, imagen },
      { new: true, runValidators: true }
    )
    if (!tutoria)
      return res.status(404).json({ mensaje: 'Tutoría no encontrada o sin permiso.' })
    res.json({ mensaje: 'Tutoría actualizada.', tutoria })
  } catch (err) {
    console.error('Error al editar tutoría:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const listarInscritos = async (req, res) => {
  const { id } = req.params
  try {
    const tutoria = await Tutoria.findOne({ _id: id, instructor: req.usuario.id })
    if (!tutoria)
      return res.status(403).json({ mensaje: 'No tienes permiso para ver estos datos.' })

    const inscritos = await Inscripcion.find({ tutoria: id, estado: 'activa' })
      .populate('usuario', 'nombre correo')
      .lean()
    res.json(inscritos)
  } catch (err) {
    console.error('Error al listar inscritos:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}
