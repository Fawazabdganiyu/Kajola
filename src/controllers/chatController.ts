import { Request, Response, NextFunction } from 'express';
import Chat from '../models/chatModel';
import User from '../models/userModel';
import CustomError from '../utils/customError';

export default class ChatController {
  // POST /api/chats Create a new chat
  public static async createChat(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { buyerId, sellerId } = req.body;

    if (buyerId === sellerId) return next(new CustomError(401, 'Unauthorized action'))

    const buyer = await User.findById(buyerId);
    const seller = await User.findById(sellerId);

    if (!buyer || !seller) return next(new CustomError(401, 'Unauthorized action'));

    const chat = new Chat({
      participants: [buyerId, sellerId],
    });
    try {
      await chat.save();

      return res.status(201).json(chat);
    } catch (error) {
      return next(new CustomError(500, 'Unable to create chat'));
    }
  }

  // GET /api/chats Get all chats for a user
  public static async getUserChats(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const userId = req.userId;
    const chats = await Chat.find({ participants: userId }).populate('participants', 'name email');
    if (!chats) {
      return next(new CustomError(404, 'Chats not found'));
    }
    return res.status(200).json(chats);
  }

  // POST /api/messages Send a message
  public static async sendMessage(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { chatId, content } = req.body;
    const senderId = req.userId;

    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return next(new CustomError(404, 'Chat not found'));
      }

      const message = {
        sender: senderId,
        content,
        createdAt: new Date(),
      };

      chat.messages.push(message);
      await chat.save();

      return res.status(201).json(message);
    } catch (error) {
      return next(new CustomError(500, 'Message not sent'));
    }
  }

  // GET /api/messages/:chatId Get messages in a chat
  public static async getMessages(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { chatId } = req.params;

    try {
      const chat = await Chat.findById(chatId).populate('messages.sender', 'name email');
      if (!chat) {
        return next(new CustomError(404, 'Chat not found'));
      }

      return res.status(200).json(chat.messages);
    } catch (error) {
      return next(new CustomError(500, 'Internal Server Error'));
    }
  }
}
