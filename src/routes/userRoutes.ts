import { Router } from 'express';
import UsersController from '../controllers/UserController';
import authMiddleware from '../middlewares/authMiddleware';

const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.get('/:id', UsersController.getUser);
userRouter.delete('/:id', UsersController.deleteUser);
