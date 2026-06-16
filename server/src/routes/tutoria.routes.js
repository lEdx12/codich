import { Router }     from 'express'
import {
  listarTutorias, buscarTutorias, detalleTutoria,
  crearTutoria, contratarTutoria, simularPagoTutoria, editarTutoria, listarInscritos,
  misInscripciones,
} from '../controllers/tutoria.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole }  from '../middleware/verifyRole.js'

const router = Router()

router.get('/buscar',       verifyToken, verifyRole('diseñador', 'instructor', 'administrador'), buscarTutorias)
router.get('/mis-inscripciones', verifyToken, verifyRole('diseñador'), misInscripciones)
router.get('/',             verifyToken, verifyRole('diseñador', 'instructor', 'administrador'), listarTutorias)
router.get('/:id',          verifyToken, verifyRole('diseñador', 'instructor', 'administrador'), detalleTutoria)
router.post('/',            verifyToken, verifyRole('instructor'), crearTutoria)
router.post('/contratar',   verifyToken, verifyRole('diseñador'), contratarTutoria)
router.post('/:id/simular-pago', verifyToken, verifyRole('diseñador'), simularPagoTutoria)
router.put('/:id',               verifyToken, verifyRole('instructor'), editarTutoria)
router.get('/:id/inscritos',verifyToken, verifyRole('instructor'), listarInscritos)

export default router
