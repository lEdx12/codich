import { Router }     from 'express'
import { listarInstructores, crearInstructor, editarInstructor, suspenderInstructor }
  from '../controllers/instructor.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole }  from '../middleware/verifyRole.js'

const router = Router()

router.use(verifyToken, verifyRole('administrador'))

router.get('/',     listarInstructores)
router.post('/',    crearInstructor)
router.put('/:id',  editarInstructor)
router.delete('/:id', suspenderInstructor)

export default router
