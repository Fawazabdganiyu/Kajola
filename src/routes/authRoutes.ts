import { Router } from 'express';
import AuthController from '../controllers/authController';
// import authMiddleware from '../middlewares/authMiddleware';

const authRouter = Router();

authRouter.post('/signup', AuthController.signup);
// authRouter.post('/login', authMiddleware, AuthController.login); // No need for authentication required to login
authRouter.get('/verify/:token', AuthController.verifyEmail);
authRouter.post('/login', AuthController.login);
authRouter.post('/logout', AuthController.logout);
authRouter.post('/forget-password', AuthController.resetToken);
authRouter.put('/password-reset/:resetToken', AuthController.resetPassword);

export default authRouter;
