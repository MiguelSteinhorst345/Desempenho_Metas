import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { DesempenhoController } from '../controllers/DesempenhoController'
const router=Router(), controller=new DesempenhoController()
router.get('/desempenho',authMiddleware,controller.resumo)
router.post('/desempenho',authMiddleware,controller.registrar)
export default router