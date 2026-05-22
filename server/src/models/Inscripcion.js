import mongoose from 'mongoose'

const inscripcionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tutoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutoria', required: true },
  pago:    { type: mongoose.Schema.Types.ObjectId, ref: 'Pago', required: true },
  estado:  { type: String, enum: ['activa', 'cancelada'], default: 'activa' },
}, { timestamps: true })

export default mongoose.model('Inscripcion', inscripcionSchema)
