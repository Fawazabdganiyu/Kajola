import express from 'express';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/index';
import authRouter from  './routes/authRoutes'
import productRouter from './routes/productRoutes';
import userRouter from './routes/userRoutes';
import chatRouter from './routes/chatRoutes';
import errorHandler from './middlewares/errorHandler';
import cors from 'cors';


const app = express();
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

export default app;
