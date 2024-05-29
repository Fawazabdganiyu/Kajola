import mongoose, { Schema } from 'mongoose';
import ChatController from '../../controllers/chatController';
import User from '../../models/userModel';
import Chat from '../../models/chatModel';
import CustomError from '../../utils/customError';
import { dbConnect, dbDisconnect } from '../mongoMemoryServer';

describe('ChatController', () => {
  let req: any;
  let res: any;
  let next: any;
  let buyerId: mongoose.Types.ObjectId;
  let sellerId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await dbConnect();

    const buyer = await User.create({
      firstName: 'Buyer',
      lastName: 'Test',
      email: 'buyer@example.com',
      password: 'password',
      phone: '1234567890',
      city: 'City',
      state: 'State',
    });

    const seller = await User.create({
      firstName: 'Seller',
      lastName: 'Test',
      email: 'seller@example.com',
      password: 'password',
      phone: '1234567890',
      city: 'City',
      state: 'State',
    });

    buyerId = buyer._id;
    sellerId = seller._id;

    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  afterAll(async () => await dbDisconnect());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createChat', () => {
    it('should create a new chat', async () => {
      req.body = { buyerId, sellerId };

      await ChatController.createChat(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        participants: [buyerId, sellerId],
      }));
    });
  });

  it('should return a 401 error if buyer or seller not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    req.body = { buyerId: nonExistentId, sellerId };

    await ChatController.createChat(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    expect(next.mock.calls[0][0].status).toBe(401);
    expect(next.mock.calls[0][0].message).toBe('Unauthorized action');
  });

  describe('getUserChats', () => {
    it('should get all chats for a user', async () => {
      const chat = new Chat({ participants: [buyerId, sellerId] });
      await chat.save();

      req.userId = buyerId;

      await ChatController.getUserChats(req, res, next);

      const expectedResponse = [
        {
          __v: 0,
          _id: chat.id.toString(),
          messages: [],
          participants: [
            { _id: buyerId.toString(), email: 'buyer@example.com' },
            { _id: sellerId.toString(), email: 'seller@example.com' }
          ]
        }
      ];
    });
  });

    it('should return an empty array if no chats found', async () => {
      req.userId = new mongoose.Types.ObjectId();

      await ChatController.getUserChats(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

  describe('sendMessage', () => {
    it('should send a message in a chat', async () => {
      const chat = new Chat({ participants: [buyerId, sellerId] });
      await chat.save();

      req.body = { chatId: chat.id, content: 'Hello, this is a test message' };
      req.userId = buyerId;

      await ChatController.sendMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        sender: buyerId,
        content: 'Hello, this is a test message',
      }));
    });

    it('should return a 404 error if chat not found', async () => {
      req.body = { chatId: null, content: 'Hello, this is a test message' };
      req.userId = buyerId;

      await ChatController.sendMessage(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('Chat not found');
    });
  });

  describe('getMessages', () => {
    it('should get messages in a chat', async () => {
      const chat = new Chat({
        participants: [buyerId, sellerId],
        messages: [{ sender: buyerId, content: 'Test message' }],
      });
      await chat.save();

      req.params = { chatId: chat._id };

      await ChatController.getMessages(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ content: 'Test message' }),
      ]));
    });

    it('should return a 404 error if chat not found', async () => {
      req.params = { chatId: null };

      await ChatController.getMessages(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('Chat not found');
    });
  });
});
