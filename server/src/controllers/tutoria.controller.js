import Tutoria     from '../models/Tutoria.js'
import Inscripcion  from '../models/Inscripcion.js'
import Pago         from '../models/Pago.js'
import pagoService  from '../services/pagoService.js'

export const listarTutorias = async (req, res) => {
  const { pagina = 1, limite = 20 } = req.query
  const skip = (parseInt(pagina) - 1) * parseInt(limite)
  try {
    const [tutorias, total] = await Promise.all([
      Tutoria.find({ estado: 'activa' })
        .populate('instructor', 'nombre')
        .skip(skip).limit(parseInt(limite))
        .lean({ virtuals: true }),
      Tutoria.countDocuments({ estado: 'activa' }),
    ])
    res.json({ tutorias, totalPaginas: Math.ceil(total / parseInt(limite)), pagina: parseInt(pagina) })
  } catch (err) {
    console.error('Error al listar tutorías:', err)
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

    res.json({ urlPago, pagoId: pago._id })
  } catch (err) {
    console.error('Error al contratar tutoría:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const editarTutoria = async (req, res) => {
  const { id } = req.params
  const { titulo, descripcion, precio, cuposTotal, estado, categoria } = req.body
  try {
    const tutoria = await Tutoria.findOneAndUpdate(
      { _id: id, instructor: req.usuario.id },
      { titulo, descripcion, precio, cuposTotal, estado, categoria },
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
