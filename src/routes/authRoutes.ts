import { Router } from 'express';
import AuthController from '../controllers/authController';
import authMiddleware from '../middlewares/authMiddleware';

const authRouter = Router();

authRouter.post('/signup', AuthController.signup);
authRouter.post('/login', authMiddleware, AuthController.login);
authRouter.post('/logout', authMiddleware, AuthController.logout);
authRouter.get('/verify/:token', authMiddleware, AuthController.verifyEmail);
authRouter.post('/password-reset/', AuthController.resetToken);
authRouter.put('/password-update/:resetToken', AuthController.updatePassword);
authRouter.post('/resetToken', AuthController.resetPassword);

export default authRouter;
