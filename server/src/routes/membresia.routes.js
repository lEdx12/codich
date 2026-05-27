import { Router }       from 'express'
import { iniciarPago, webhookPago, obtenerEstado, simularPago } from '../controllers/membresia.controller.js'
import { verifyToken }  from '../middleware/verifyToken.js'
import { verifyRole }   from '../middleware/verifyRole.js'

const router = Router()

router.post('/pagar',   verifyToken, verifyRole('diseñador'), iniciarPago)
router.post('/webhook', webhookPago)
router.get('/estado',   verifyToken, verifyRole('diseñador'), obtenerEstado)
router.post('/simular', verifyToken, verifyRole('diseñador'), simularPago)

export default router
