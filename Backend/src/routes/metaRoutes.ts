import { Router } from 'express'
import { MetaController } from '../controllers/MetaController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const metaController = new MetaController()

router.get('/metas', authMiddleware, metaController.listar)
router.get('/metas/resumo', authMiddleware, metaController.resumo)
router.get('/metas/:id', authMiddleware, metaController.buscarPorId)
router.post('/metas', authMiddleware, metaController.criar)
router.patch('/metas/:id', authMiddleware, metaController.atualizar)
router.delete('/metas/:id', authMiddleware, metaController.excluir)

export default router
