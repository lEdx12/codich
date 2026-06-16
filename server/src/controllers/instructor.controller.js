import Usuario   from '../models/Usuario.js'
import Membresia from '../models/Membresia.js'

export const listarInstructores = async (_req, res) => {
  try {
    const instructores = await Usuario.find({ rol: 'instructor' })
      .select('-passwordHash -intentosFallidos -bloqueadoHasta')
      .lean()
    res.json(instructores)
  } catch (err) {
    console.error('Error al listar instructores:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const crearInstructor = async (req, res) => {
  const { nombre, correo, especialidad, password } = req.body
  if (!nombre || !correo || !password)
    return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios.' })

  try {
    const existe = await Usuario.findOne({ correo })
    if (existe)
      return res.status(409).json({ mensaje: 'Este correo ya está registrado.' })

    const instructor = await Usuario.create({
      nombre,
      correo,
      especialidad: especialidad || '',
      passwordHash: password,
      rol: 'instructor',
    })

    res.status(201).json({
      mensaje: 'Instructor creado.',
      instructor: { id: instructor._id, nombre: instructor.nombre, correo: instructor.correo },
    })
  } catch (err) {
    console.error('Error al crear instructor:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const editarInstructor = async (req, res) => {
  const { id } = req.params
  const { nombre, especialidad, estado, password } = req.body

  if (password && password.length < 8)
    return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 8 caracteres.' })

  try {
    const instructor = await Usuario.findOne({ _id: id, rol: 'instructor' })
    if (!instructor)
      return res.status(404).json({ mensaje: 'Instructor no encontrado.' })

    if (nombre)       instructor.nombre       = nombre
    if (especialidad !== undefined) instructor.especialidad = especialidad
    if (estado)       instructor.estado       = estado
    if (password)     instructor.passwordHash = password

    // Al cambiar la contraseña o reactivar la cuenta, se elimina cualquier bloqueo previo
    if (password || estado === 'activo') {
      instructor.intentosFallidos = 0
      instructor.bloqueadoHasta   = null
    }

    await instructor.save({ validateBeforeSave: false })

    const resultado = instructor.toObject()
    delete resultado.passwordHash
    res.json({ mensaje: 'Instructor actualizado.', instructor: resultado })
  } catch (err) {
    console.error('Error al editar instructor:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const listarDisenadores = async (_req, res) => {
  try {
    const disenadores = await Usuario.find({ rol: 'diseñador' })
      .select('-passwordHash -intentosFallidos -bloqueadoHasta')
      .lean()
    const ids = disenadores.map(d => d._id)
    const membresias = await Membresia.find({ usuario: { $in: ids } }).lean()
    const memMap = Object.fromEntries(membresias.map(m => [m.usuario.toString(), m]))
    const resultado = disenadores.map(d => ({
      ...d,
      membresia: memMap[d._id.toString()] || null,
    }))
    res.json(resultado)
  } catch (err) {
    console.error('Error al listar diseñadores:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const toggleEstadoInstructor = async (req, res) => {
  const { id } = req.params
  try {
    const instructor = await Usuario.findOne({ _id: id, rol: 'instructor' })
    if (!instructor)
      return res.status(404).json({ mensaje: 'Instructor no encontrado.' })

    instructor.estado = instructor.estado === 'activo' ? 'suspendido' : 'activo'
    // Al reactivar la cuenta, se elimina cualquier bloqueo por intentos fallidos
    if (instructor.estado === 'activo') {
      instructor.intentosFallidos = 0
      instructor.bloqueadoHasta   = null
    }
    await instructor.save({ validateBeforeSave: false })

    res.json({ mensaje: `Instructor ${instructor.estado}.`, instructor })
  } catch (err) {
    console.error('Error al cambiar estado instructor:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const eliminarInstructor = async (req, res) => {
  const { id } = req.params
  try {
    const instructor = await Usuario.findOneAndDelete({ _id: id, rol: 'instructor' })
    if (!instructor)
      return res.status(404).json({ mensaje: 'Instructor no encontrado.' })
    res.json({ mensaje: 'Instructor eliminado permanentemente.' })
  } catch (err) {
    console.error('Error al eliminar instructor:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}
