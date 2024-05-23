import { Router } from 'express';
import UsersController from '../controllers/UserController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/:id', UsersController.getUser);
router.delete('/:id', UsersController.deleteUser);

export default router;
