import { Router }     from 'express'
import { listarInstructores, crearInstructor, editarInstructor, toggleEstadoInstructor, eliminarInstructor, listarDisenadores }
  from '../controllers/instructor.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole }  from '../middleware/verifyRole.js'

const router = Router()

router.use(verifyToken, verifyRole('administrador'))

router.get('/',           listarInstructores)
router.get('/disenadores', listarDisenadores)
router.post('/',           crearInstructor)
router.put('/:id',         editarInstructor)
router.patch('/:id/toggle', toggleEstadoInstructor)
router.delete('/:id',      eliminarInstructor)

export default router
