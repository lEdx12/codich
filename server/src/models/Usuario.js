import mongoose from 'mongoose'
import bcrypt    from 'bcrypt'

const usuarioSchema = new mongoose.Schema({
  nombre:           { type: String, required: true, trim: true },
  apellidos:        { type: String, required: true, trim: true },
  correo:           { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:     { type: String, required: true },
  fechaNacimiento:  { type: Date, required: true },
  rol:              { type: String, enum: ['diseñador', 'instructor', 'administrador'], required: true },
  estado:           { type: String, enum: ['activo', 'suspendido', 'pendiente'], default: 'activo' },
  especialidad:     { type: String, default: '' },
  intentosFallidos: { type: Number, default: 0 },
  bloqueadoHasta:   { type: Date, default: null },
  resetTokenHash:   { type: String, default: null },
  resetTokenExpira: { type: Date, default: null },
}, { timestamps: true })

usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next()
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
  next()
})

usuarioSchema.methods.compararPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash)
}

export default mongoose.model('Usuario', usuarioSchema)
