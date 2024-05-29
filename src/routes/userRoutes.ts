import e, { Router } from 'express';
import UsersController from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';

const userRouter = Router();

userRouter.get(/me$/, authMiddleware, UsersController.getMe);
userRouter.get('/:id', UsersController.getUser);
userRouter.get('/me', authMiddleware, UsersController.getMe);
userRouter.put('/:id', authMiddleware, UsersController.updateUser);
userRouter.delete('/:id', authMiddleware, UsersController.deleteUser);

export default userRouter;
