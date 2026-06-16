import 'dotenv/config'
import express    from 'express'
import cors       from 'cors'
import { connectDB } from './config/db.js'
import { rateLimiter, authRateLimiter } from './middleware/rateLimiter.js'

import authRoutes       from './routes/auth.routes.js'
import membresiaRoutes  from './routes/membresia.routes.js'
import instructorRoutes from './routes/instructor.routes.js'
import informeRoutes    from './routes/informe.routes.js'
import tutoriaRoutes    from './routes/tutoria.routes.js'
import materialRoutes   from './routes/material.routes.js'
import estadisticasRoutes from './routes/estadisticas.routes.js'

const app = express()

// Conectar base de datos
connectDB()

// Middleware globales
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(rateLimiter)

// Archivos subidos (material de tutorías)
app.use('/uploads', express.static('uploads'))

// Rutas
app.use('/api/auth',        authRateLimiter, authRoutes)
app.use('/api/membresia',   membresiaRoutes)
app.use('/api/instructores', instructorRoutes)
app.use('/api/informes',    informeRoutes)
app.use('/api/tutorias',    tutoriaRoutes)
app.use('/api/materiales',  materialRoutes)
app.use('/api/estadisticas', estadisticasRoutes)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Handler 404
app.use((_req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada.' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Servidor CODICH corriendo en puerto ${PORT}`))

export default app
