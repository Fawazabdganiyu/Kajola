import { Router } from 'express';
import { FileMiddleware } from '../middlewares/fileMiddleware';
import FileController from '../controllers/fileController';
import authMiddleware from '../middlewares/authMiddleware';

const fileRouter = Router();

fileRouter.put('/profile-pic', authMiddleware, FileMiddleware.singleUpload('file', 'profile-pic'), FileController.uploadProfilePic);
fileRouter.post('/product-pic', authMiddleware, FileMiddleware.multipleUpload('files', 5, 'product-pic'), FileController.uploadProductPic);
fileRouter.post('/chat-file', authMiddleware, FileMiddleware.multipleUpload('file', 10, 'chat-file'), FileController.uploadChatFile);

export default fileRouter;
