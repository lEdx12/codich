import { Router }   from 'express'
import multer        from 'multer'
import path          from 'path'
import { subirMaterial, listarMateriales } from '../controllers/material.controller.js'
import { verifyToken }  from '../middleware/verifyToken.js'
import { verifyRole }   from '../middleware/verifyRole.js'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const fileFilter = (_req, file, cb) => {
  const allowed = ['application/pdf', 'video/mp4']
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Solo PDF o MP4.'), false)
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } })

const router = Router()

router.post('/',              verifyToken, verifyRole('instructor'), upload.single('material'), subirMaterial)
router.get('/:tutoriaId',     verifyToken, listarMateriales)

export default router
