import { Router } from 'express'
import { CronogramaController } from '../controllers/CronogramaController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const cronogramaController = new CronogramaController()

router.get('/cronogramas', authMiddleware, cronogramaController.listar)
router.get('/cronogramas/:id', authMiddleware, cronogramaController.buscarPorId)
router.post('/cronogramas', authMiddleware, cronogramaController.criar)
router.patch('/cronogramas/:id', authMiddleware, cronogramaController.atualizar)
router.delete('/cronogramas/:id', authMiddleware, cronogramaController.excluir)

export default router