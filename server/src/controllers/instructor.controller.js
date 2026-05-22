import Usuario from '../models/Usuario.js'

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
  const { nombre, especialidad, estado } = req.body
  try {
    const instructor = await Usuario.findOneAndUpdate(
      { _id: id, rol: 'instructor' },
      { nombre, especialidad, estado },
      { new: true, runValidators: true }
    ).select('-passwordHash')

    if (!instructor)
      return res.status(404).json({ mensaje: 'Instructor no encontrado.' })

    res.json({ mensaje: 'Instructor actualizado.', instructor })
  } catch (err) {
    console.error('Error al editar instructor:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const suspenderInstructor = async (req, res) => {
  const { id } = req.params
  try {
    const instructor = await Usuario.findOneAndUpdate(
      { _id: id, rol: 'instructor' },
      { estado: 'suspendido' },
      { new: true }
    ).select('-passwordHash')

    if (!instructor)
      return res.status(404).json({ mensaje: 'Instructor no encontrado.' })

    res.json({ mensaje: 'Instructor suspendido.', instructor })
  } catch (err) {
    console.error('Error al suspender instructor:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}
