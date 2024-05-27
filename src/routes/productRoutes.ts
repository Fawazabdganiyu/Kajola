import { Router } from 'express';

import authMiddleware from '../middlewares/authMiddleware';
import ProductController from '../controllers/ProductController';

const router = Router();

router.post('/', authMiddleware, ProductController.createProduct);
router.get('/', authMiddleware, ProductController.getProducts);
router.put('/:id', authMiddleware, ProductController.updateProduct);
router.delete('/:id', authMiddleware, ProductController.deleteProduct);
router.get('/:id', ProductController.getProductById);
router.get('/user/:id', ProductController.getProductsByUser);

export default router;
