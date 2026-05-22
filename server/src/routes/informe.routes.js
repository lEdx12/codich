import { Router }     from 'express'
import { generarInforme } from '../controllers/informe.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole }  from '../middleware/verifyRole.js'

const router = Router()

router.get('/generar', verifyToken, verifyRole('administrador'), generarInforme)

export default router
