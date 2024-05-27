import { Router } from 'express';

import authMiddleware from '../middlewares/authMiddleware';
import ProductController from '../controllers/ProductController';

const router = Router();

router.post('/', authMiddleware, ProductController.createProduct);
router.put('/:id', authMiddleware, ProductController.updateProduct);
router.delete('/:id', authMiddleware, ProductController.deleteProduct);

export default router;
