import { Router }     from 'express'
import {
  listarTutorias, buscarTutorias, detalleTutoria,
  contratarTutoria, editarTutoria, listarInscritos,
} from '../controllers/tutoria.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole }  from '../middleware/verifyRole.js'

const router = Router()

router.get('/buscar',       verifyToken, verifyRole('diseñador', 'instructor', 'administrador'), buscarTutorias)
router.get('/',             verifyToken, verifyRole('diseñador', 'instructor', 'administrador'), listarTutorias)
router.get('/:id',          verifyToken, verifyRole('diseñador', 'instructor', 'administrador'), detalleTutoria)
router.post('/contratar',   verifyToken, verifyRole('diseñador'), contratarTutoria)
router.put('/:id',          verifyToken, verifyRole('instructor'), editarTutoria)
router.get('/:id/inscritos',verifyToken, verifyRole('instructor'), listarInscritos)

export default router
