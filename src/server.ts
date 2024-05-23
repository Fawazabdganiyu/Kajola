import express from 'express';
import indexRouter from './routes/index';
import env from './config/environment';
import errorHandler from './middlewares/errorHandler';

const app = express();
app.use(express.json());

// indexRouter is the default route
app.use('/', indexRouter);

// Error handler
app.use(errorHandler);

// Start the server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
