import jwt      from 'jsonwebtoken'
import crypto   from 'crypto'
import Usuario  from '../models/Usuario.js'
import emailService from '../services/emailService.js'

const MAX_INTENTOS = 3
const BLOQUEO_MS   = 15 * 60 * 1000

export const login = async (req, res) => {
  const { correo, password } = req.body
  if (!correo || !password)
    return res.status(400).json({ mensaje: 'Correo y contraseña son requeridos.' })

  try {
    const usuario = await Usuario.findOne({ correo })
    if (!usuario)
      return res.status(401).json({ mensaje: 'Credenciales incorrectas.' })

    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date())
      return res.status(403).json({ mensaje: 'Cuenta bloqueada temporalmente. Contacta al administrador.' })

    const passwordOk = await usuario.compararPassword(password)
    if (!passwordOk) {
      usuario.intentosFallidos += 1
      if (usuario.intentosFallidos >= MAX_INTENTOS) {
        usuario.bloqueadoHasta    = new Date(Date.now() + BLOQUEO_MS)
        usuario.intentosFallidos  = 0
      }
      await usuario.save({ validateBeforeSave: false })
      return res.status(401).json({ mensaje: 'Credenciales incorrectas.' })
    }

    usuario.intentosFallidos = 0
    usuario.bloqueadoHasta   = null
    await usuario.save({ validateBeforeSave: false })

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
    )

    res.json({
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol },
    })
  } catch (err) {
    console.error('Error en login:', err)
    res.status(500).json({ mensaje: 'Error interno. Intenta más tarde.' })
  }
}

export const register = async (req, res) => {
  const { nombre, apellidos, correo, password, fechaNacimiento } = req.body
  if (!nombre || !apellidos || !correo || !password || !fechaNacimiento)
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' })
  if (password.length < 8)
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres.' })

  try {
    const existe = await Usuario.findOne({ correo })
    if (existe)
      return res.status(409).json({ mensaje: 'Este correo ya está registrado.' })

    const usuario = await Usuario.create({
      nombre,
      apellidos,
      correo,
      passwordHash: password,
      fechaNacimiento,
      rol: 'diseñador',
    })

    emailService.enviarBienvenida({ correo, nombre }).catch(console.error)

    res.status(201).json({
      mensaje: 'Cuenta creada exitosamente.',
      usuario: { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol },
    })
  } catch (err) {
    console.error('Error en register:', err)
    res.status(500).json({ mensaje: 'Error interno. Intenta más tarde.' })
  }
}

export const solicitarReset = async (req, res) => {
  const { correo } = req.body
  if (!correo)
    return res.status(400).json({ mensaje: 'El correo es requerido.' })

  try {
    const usuario = await Usuario.findOne({ correo })
    if (!usuario)
      return res.json({ mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.' })

    const token = crypto.randomBytes(32).toString('hex')
    const hash  = crypto.createHash('sha256').update(token).digest('hex')

    usuario.resetTokenHash   = hash
    usuario.resetTokenExpira = new Date(Date.now() + 60 * 60 * 1000)
    await usuario.save({ validateBeforeSave: false })

    const enlace = `${process.env.CLIENT_URL || 'http://localhost:5173'}/resetear-password?token=${token}`
    emailService.enviarResetPassword({ correo, nombre: usuario.nombre, enlace }).catch(console.error)

    res.json({ mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.' })
  } catch (err) {
    console.error('Error en solicitarReset:', err)
    res.status(500).json({ mensaje: 'Error interno. Intenta más tarde.' })
  }
}

export const resetPassword = async (req, res) => {
  const { token, password } = req.body
  if (!token || !password)
    return res.status(400).json({ mensaje: 'Token y contraseña son requeridos.' })
  if (password.length < 8)
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres.' })

  try {
    const hash = crypto.createHash('sha256').update(token).digest('hex')
    const usuario = await Usuario.findOne({
      resetTokenHash:   hash,
      resetTokenExpira: { $gt: new Date() },
    })

    if (!usuario)
      return res.status(400).json({ mensaje: 'El enlace de recuperación es inválido o ha expirado.' })

    usuario.passwordHash     = password
    usuario.resetTokenHash   = null
    usuario.resetTokenExpira = null
    await usuario.save({ validateBeforeSave: false })

    res.json({ mensaje: 'Contraseña actualizada exitosamente.' })
  } catch (err) {
    console.error('Error en resetPassword:', err)
    res.status(500).json({ mensaje: 'Error interno. Intenta más tarde.' })
  }
}
