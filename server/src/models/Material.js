import mongoose from 'mongoose'

const materialSchema = new mongoose.Schema({
  tutoria:       { type: mongoose.Schema.Types.ObjectId, ref: 'Tutoria', required: true },
  instructor:    { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  nombreArchivo: { type: String, required: true },
  urlArchivo:    { type: String, required: true },
  formato:       { type: String, enum: ['pdf', 'mp4'], required: true },
  tamano:        { type: Number },
}, { timestamps: true })

export default mongoose.model('Material', materialSchema)
