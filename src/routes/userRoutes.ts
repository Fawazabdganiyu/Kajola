import { Router } from 'express';
import UsersController from '../controllers/UserController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.get('/:id', UsersController.getUser);
router.delete('/:id', authMiddleware, UsersController.deleteUser);

export default router;
