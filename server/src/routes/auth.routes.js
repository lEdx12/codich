import { Router } from 'express'
import { login, register, solicitarReset, resetPassword } from '../controllers/auth.controller.js'

const router = Router()

router.post('/register',           register)
router.post('/login',              login)
router.post('/recuperar-password', solicitarReset)
router.post('/resetear-password',  resetPassword)

export default router
