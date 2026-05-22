import mongoose from 'mongoose'

const membresiaSchema = new mongoose.Schema({
  usuario:        { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  plan:           { type: String, enum: ['mensual', 'anual', 'senior'], required: true },
  estado:         { type: String, enum: ['activa', 'vencida', 'pendiente'], default: 'pendiente' },
  fechaInicio:    { type: Date },
  fechaFin:       { type: Date },
  renovacionAuto: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Membresia', membresiaSchema)
