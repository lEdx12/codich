import { Router }      from 'express'
import { obtenerEstadisticas } from '../controllers/estadisticas.controller.js'
import { verifyToken }  from '../middleware/verifyToken.js'
import { verifyRole }   from '../middleware/verifyRole.js'

const router = Router()

router.use(verifyToken, verifyRole('administrador'))

router.get('/', obtenerEstadisticas)

export default router
