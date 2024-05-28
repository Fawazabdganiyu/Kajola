import { Server } from 'socket.io';
import { createServer } from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import Chat from '../../models/chatModel';
import User from '../../models/userModel';
import jwt from 'jsonwebtoken';
import env from '../../config/environment';
import chatSocket from '../../sockets/chatSocket';

jest.mock('../../models/chatModel');
jest.mock('../../models/userModel');
jest.mock('jsonwebtoken');

let io: Server;
let httpServer: ReturnType<typeof createServer>;
let clientSocket: ClientSocket;

beforeAll((done) => {
  httpServer = createServer();
  io = new Server(httpServer);
  chatSocket(io);
  httpServer.listen(() => {
    const port = (httpServer.address() as any).port;
    clientSocket = Client(`http://localhost:${port}`);
    clientSocket.on('connect', done);
  });
});

afterAll(() => {
  io.close();
  httpServer.close();
});

afterEach(() => {
  if (clientSocket.connected) {
    clientSocket.disconnect();
  }
});

describe('ChatSocket', () => {
  it('should join a user to a chat', (done) => {
    const mockUser = { _id: '123' };
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (jwt.verify as jest.Mock).mockReturnValue({ id: mockUser._id });

    clientSocket.emit('join', 'token');
    clientSocket.on('joined', (userId) => {
      expect(userId).toBe(mockUser._id.toString());
      done();
    });
  });
  

  it('should send a message', (done) => {
    jest.setTimeout(15000); // Increase timeout for this test

    const mockUser = { _id: '123' };
    const mockChat = { _id: '456', participants: [mockUser._id], messages: [], save: jest.fn().mockResolvedValue(true) };
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (Chat.findById as jest.Mock).mockResolvedValue(mockChat);
    (jwt.verify as jest.Mock).mockReturnValue({ id: mockUser._id });

    clientSocket.emit('send-message', { token: 'token', chatId: mockChat._id, message: 'Hello, world!' });
    clientSocket.on('new-message', (data) => {
      expect(data.message).toBe('Hello, world!');
      expect(data.user).toBe(mockUser._id.toString());
      done();
    });
  });
});
