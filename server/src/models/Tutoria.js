import mongoose from 'mongoose'

const tutoriaSchema = new mongoose.Schema({
  instructor:    { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  titulo:        { type: String, required: true, maxlength: 200 },
  descripcion:   { type: String, required: true, maxlength: 500 },
  precio:        { type: Number, required: true },
  cuposTotal:    { type: Number, required: true },
  cuposOcupados: { type: Number, default: 0 },
  estado:        { type: String, enum: ['activa', 'inactiva', 'borrador'], default: 'borrador' },
  categoria:     { type: String, required: true },
  imagen:        { type: String, default: '' },
  materiales:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
}, { timestamps: true })

tutoriaSchema.virtual('cuposDisponibles').get(function () {
  return this.cuposTotal - this.cuposOcupados
})

tutoriaSchema.set('toJSON', { virtuals: true })
tutoriaSchema.set('toObject', { virtuals: true })

export default mongoose.model('Tutoria', tutoriaSchema)
