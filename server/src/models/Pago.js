import mongoose from 'mongoose'

const pagoSchema = new mongoose.Schema({
  usuario:       { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  membresia:     { type: mongoose.Schema.Types.ObjectId, ref: 'Membresia' },
  inscripcion:   { type: mongoose.Schema.Types.ObjectId, ref: 'Inscripcion' },
  monto:         { type: Number, required: true },
  moneda:        { type: String, default: 'CLP' },
  estado:        { type: String, enum: ['pendiente', 'aprobado', 'rechazado', 'timeout'], default: 'pendiente' },
  idTransaccion: { type: String },
  concepto:      { type: String },
}, { timestamps: true })

export default mongoose.model('Pago', pagoSchema)
