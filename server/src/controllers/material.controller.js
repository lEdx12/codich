import path     from 'path'
import Material  from '../models/Material.js'
import Tutoria   from '../models/Tutoria.js'

export const subirMaterial = async (req, res) => {
  const { tutoriaId } = req.body
  const usuarioId     = req.usuario.id

  if (!req.file)
    return res.status(400).json({ mensaje: 'Archivo requerido (PDF o MP4).' })

  try {
    const tutoria = await Tutoria.findOne({ _id: tutoriaId, instructor: usuarioId })
    if (!tutoria)
      return res.status(403).json({ mensaje: 'No tienes permiso sobre esta tutoría.' })

    const ext     = path.extname(req.file.originalname).toLowerCase().slice(1)
    const formato = ext === 'mp4' ? 'mp4' : 'pdf'

    const material = await Material.create({
      tutoria:       tutoriaId,
      instructor:    usuarioId,
      nombreArchivo: req.file.originalname,
      urlArchivo:    `/uploads/${req.file.filename}`,
      formato,
      tamano:        req.file.size,
    })

    await Tutoria.findByIdAndUpdate(tutoriaId, { $push: { materiales: material._id } })

    res.status(201).json({ mensaje: 'Material subido correctamente.', material })
  } catch (err) {
    console.error('Error al subir material:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}

export const listarMateriales = async (req, res) => {
  const { tutoriaId } = req.params
  try {
    const materiales = await Material.find({ tutoria: tutoriaId }).lean()
    res.json(materiales)
  } catch (err) {
    console.error('Error al listar materiales:', err)
    res.status(500).json({ mensaje: 'Error interno.' })
  }
}
