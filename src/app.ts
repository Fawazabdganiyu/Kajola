import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from  './routes/authRoutes'
import userRouter from './routes/userRoutes';
import errorHandler from './middlewares/errorHandler';

const app = express();
app.use(express.json());
app.use(cookieParser());

// userRouter
app.use('/users', userRouter);

// authRouter for authenticatons 
app.use('/auth', authRouter);

// Error handler
app.use(errorHandler);

export default app;
