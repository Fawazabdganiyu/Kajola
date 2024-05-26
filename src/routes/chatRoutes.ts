import { Router } from 'express';
import ChatController from '../controllers/chatController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

// Chat routes
router.post('/api/chats', authMiddleware, ChatController.createChat);
router.get('/api/chats', authMiddleware, ChatController.getUserChats);
router.post('/api/messages', authMiddleware, ChatController.sendMessage);
router.get('/api/messages/:chatId', authMiddleware, ChatController.getMessages);

export default router;
