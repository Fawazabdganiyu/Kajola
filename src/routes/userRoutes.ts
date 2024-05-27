import e, { Router } from 'express';
import UsersController from '../controllers/UserController';
import authMiddleware from '../middlewares/authMiddleware';

const userRouter = Router();

userRouter.get('/:id', UsersController.getUser);
userRouter.put('/:id', authMiddleware, UsersController.updateUser);
userRouter.delete('/:id', authMiddleware, UsersController.deleteUser);

export default userRouter;
