import { Server, Socket } from 'socket.io';
import Chat from '../models/chatModel';
import User from '../models/userModel';
import jwt from 'jsonwebtoken';
import env from '../config/environment';
import CustomError from '../utils/customError'
import { UserPayload } from '../types';

const chatSocket = (io: Server) => {
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new CustomError(401, 'Authentication error: Token not provided'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET as string) as UserPayload;
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new CustomError(401, 'Authentication error: User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      console.error(401, 'Authentication error:', error);
      next(new CustomError(401, 'Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.data.user._id);

    socket.on('joinChat', async (chatId: string) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return socket.emit('error', 'Chat not found');
        }

        if (!chat.participants.includes(socket.data.user._id)) {
          return socket.emit('error', 'Not a participant of this chat');
        }

        socket.join(chatId);
        socket.emit('joinedChat', chatId);
        console.log(`User ${socket.data.user._id} joined chat ${chatId}`);
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', 'Error joining chat');
      }
    });

    socket.on('sendMessage', async ({ chatId, content }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return socket.emit('error', 'Chat not found');
        }

        if (!chat.participants.includes(socket.data.user._id)) {
          return socket.emit('error', 'Not a participant of this chat');
        }

        const message = {
          sender: socket.data.user._id,
          content,
          createdAt: new Date(),
        };

        chat.messages.push(message);
        await chat.save();

        io.to(chatId).emit('message', message);
        console.log(`Message sent to chat ${chatId} by user ${socket.data.user._id}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Error sending message');
      }
    });

    socket.on('typing', (chatId: string) => {
      socket.to(chatId).emit('typing', socket.data.user._id);
    });

    socket.on('stopTyping', (chatId: string) => {
      socket.to(chatId).emit('stopTyping', socket.data.user._id);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.data.user._id);
    });
  });
};

export default chatSocket;
