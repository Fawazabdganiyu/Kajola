import express from 'express';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/index';
import authRouter from  './routes/authRoutes'
import productRouter from './routes/productRoutes';
import userRouter from './routes/userRoutes';
import chatRouter from './routes/chatRoutes';
import env from './config/environment';
import errorHandler from './middlewares/errorHandler';
import cors from 'cors';

import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import chatSocket from './sockets/chatSocket';

const app = express();

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Allow all origins
  },
});

// Setup Socket.IO
chatSocket(io);


app.use(cors());
app.use(express.json());
app.use(cookieParser());

// indexRouter is the default route
app.use('/', indexRouter);
 
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/chats', chatRouter);

// Error handler
app.use(errorHandler);

// Start the server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
