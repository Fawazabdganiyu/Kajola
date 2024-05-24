import { Router } from 'express';

import authMiddleware from '../middlewares/authMiddleware';
import ProductController from '../controllers/ProductController';

const router = Router();

router.post('/', authMiddleware, ProductController.createProduct);

export default router;
