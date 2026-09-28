import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router()
const controller = new AuthController()

router.post('/register', controller.register.bind(controller))
router.post('/login', controller.login.bind(controller))

router.get('/me', authMiddleware, controller.me.bind(controller))
router.post('/logoff', authMiddleware, controller.logoff.bind(controller))

export default router