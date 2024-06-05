import { Router } from 'express';
import ChatController from '../controllers/chatController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

// Chat routes
router.post('/new_chat', authMiddleware, ChatController.createChat);
router.get('/conversations', authMiddleware, ChatController.getUserChats);
router.post('/messages', authMiddleware, ChatController.sendMessage);
router.get('/messages/:chatId', authMiddleware, ChatController.getMessages);

export default router;
