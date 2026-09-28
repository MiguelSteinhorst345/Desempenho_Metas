import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = Router()
const controller = new UserController()

router.get('/', authMiddleware, controller.findAllUser.bind(controller))

router.get('/:id', authMiddleware, adminMiddleware, controller.getUserById.bind(controller))
router.get('/email/:email', authMiddleware, adminMiddleware, controller.getUserByEmail.bind(controller))

router.patch('/:id', authMiddleware, controller.updateUser.bind(controller))
router.delete('/:id', authMiddleware, controller.deleteUser.bind(controller))

router.patch('/promove/:id', authMiddleware, adminMiddleware, controller.promove.bind(controller))

export default router   