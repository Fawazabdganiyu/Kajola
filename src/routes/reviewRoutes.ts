import { Router } from 'express';

import authMiddleware from '../middlewares/authMiddleware';
import ReviewController from '../controllers/reviewController';

const reviewRouter = Router();

reviewRouter.post('/', authMiddleware, ReviewController.createReview);
reviewRouter.put('/:id', authMiddleware, ReviewController.updateReview);


export default reviewRouter;
