import express from 'express';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/index';
import authRouter from  './routes/authRoutes'
import env from './config/environment';
import errorHandler from './middlewares/errorHandler';

const app = express();
app.use(express.json());
app.use(cookieParser());

// indexRouter is the default route
app.use('/', indexRouter);

// authRouter for authenticatons 
app.use('/auth', authRouter);

// Error handler
app.use(errorHandler);

// Start the server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
