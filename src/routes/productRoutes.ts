import { Router } from 'express';

import authMiddleware from '../middlewares/authMiddleware';
import ProductController from '../controllers/productController';

const productRouter = Router();

productRouter.post('/', authMiddleware, ProductController.createProduct);
productRouter.get('/', authMiddleware, ProductController.getProducts);
productRouter.put('/:id', authMiddleware, ProductController.updateProduct);
productRouter.delete('/:id', authMiddleware, ProductController.deleteProduct);
productRouter.post('/:id/wishlist', authMiddleware, ProductController.addToWishlist);
productRouter.delete('/:id/wishlist', authMiddleware, ProductController.removeFromWishlist);
productRouter.get('/wishlist', authMiddleware, ProductController.getWishlist);
productRouter.get('/:id', ProductController.getProductById);
productRouter.get('/user/:id', ProductController.getProductsByUser);
productRouter.get('/:id/reviews', ProductController.getProductReviews);

export default productRouter;
