import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import CustomError from '../utils/customError';
import Product from '../models/productModel';
import User from '../models/userModel';
import { IProduct, IUser } from '../types';

export default class ProductController {
  // POST /products - Create a new product
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    const { name, category, description, price, negotiable = true } = req.body;

    // Check active user
    if (!req.userId) {
      return next(new CustomError(401, 'Not authorized, user not found'));
    }

    // Check if the user is verified
    if (!req.verified) {
      return next(new CustomError(403, 'Please verify your email to display your product/services'));
    }
  
    // Validate input
    if (!name) return next(new CustomError(400, 'Product name is missing'));
    if (!category) return next(new CustomError(400, 'Category is missing'));
    if (!description) return next(new CustomError(400, 'Description is missing'));
    if (!price) return next(new CustomError(400, 'Price is missing'));

    const existingProduct: IProduct | null = await Product.findOne({ userId: req.userId, name });
    if (existingProduct) {
      return next(new CustomError(400, 'Product already exists'));
    }

    const user = await User.findById(req.userId);
    if ( user?.userType === 'Buyer' ) {
      // Update user type to Seller
      user.userType = 'Seller';
      await user.save();
    }

    try {
      const newProduct = await Product.create({
        name, category, description, price, negotiable, userId: req.userId
      });
      res.status(201).json(newProduct.toObject());
    } catch (error: any) {
      next(new CustomError(500, 'Failed to create product'));
    }
  }

  // PUT /api/products/:id - Update a product
  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new CustomError(400, 'Invalid product id'));
    }
    // Ensure only specific fields can be updated
    const { name, category, description, price, negotiable } = req.body;

    // Check if the product exists
    const product = await Product.findById(id);
    if (!product) {
      return next(new CustomError(404, 'Product not found'));
    }

    // Authenticate the user
    if (req.userId?.toString() !== product.userId.toString()) {
      return next(new CustomError(403, 'You are not authorized to update this product'));
    }

    // Update the product
    await Product.findByIdAndUpdate(id, { name, category, description, price, negotiable });
    const updatedProduct: IProduct | null = await Product.findById(id);
    res.status(200).json(updatedProduct?.toObject());
  }

  // GET /api/products - Get all products by query if any
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { name, category, minPrice, maxPrice, page = 1, userLocation } = req.query;
    
    // Build the query
    const query: any = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (category) query.category = { $regex: category, $options: 'i' };
    if (minPrice && maxPrice) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice) {
      query.price = { $gte: minPrice };
    } else if (maxPrice) {
      query.price = { $lte: maxPrice };
    }

    if (userLocation === 'true') {
      // Add user city and state to the query
      if (req.userId) {
        const user = await User.findById(req.userId).select('city state');
        query['user.city'] = user?.city;
        query['user.state'] = user?.state;
      }
    }

    const products = await Product.aggregate([
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: query },
      { $sort: { averageRating: -1 } },
      { $skip: (Number(page) - 1) * 10 },
      { $limit: 10 }
    ]);
    const matchedCount = products.length;

    const data = products.map(function (product) {
      if (product.user) {
        const { _id, firstName, lastName, desc, img, userType, city, state, phone } = product.user;
        product.user = { _id, firstName, lastName, desc, img, userType, city, state, phone };
      }
      return product;
    });

    res.status(200).json({ matchedCount, data });
  }

  // GET /api/products/:id - Get a product by id
  static async getProductById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new CustomError(400, 'Invalid product id'));
    }

    const product = await Product.findById(id);
    if (!product) {
      return next(new CustomError(404, 'Product not found'));
    }

    res.status(200).json(product.toObject());
  }

  // GET /api/products/user/:userId - Get all products by a user
  static async getProductsByUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new CustomError(400, 'Invalid product id'));
    }

    const products = await Product.find({ userId: id });
    if (!products) {
      return next(new CustomError(404, 'Products not found'));
    }

    const data: IProduct[] = products.map(product => product.toObject());

    res.status(200).json({ count: data.length, data });
  }

  // DELETE /api/products/:id - Delete a product
  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<Response | void>{
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new CustomError(400, 'Invalid product id'));
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return next(new CustomError(404, 'Product not found'));
    }

    if (req.userId?.toString() !== product.userId.toString()) {
      return next(new CustomError(403, 'You are not authorized to delete this product'));
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, data: 'Product deleted successfully' });
  }

  // POST /api/products/:id/wishlist - Add product to wishlist
  static async addToWishlist(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new CustomError(400, 'Invalid product id'));
    }

    const product: IProduct | null = await Product.findById(id);
    if (!product) {
      return next(new CustomError(404, 'Product not found'));
    }

    if (req.userId) {
      const user: IUser | null = await User.findById(req.userId);
      if (user?.wishlist.includes(id)) {
        return next(new CustomError(400, 'Product already in wishlist'));
      }
      user?.wishlist.push(id);
      await user?.save();
    } else {
      return next(new CustomError(403, 'Please login to add product to wishlist'));
    }

    res.status(200).json({ success: true, message: 'Product successfully added to wishlist' });
  }

  // DELETE /api/products/:id/wishlist - Remove product from wishlist
  static async removeFromWishlist(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new CustomError(400, 'Invalid product id'));
    }

    const product: IProduct | null = await Product.findById(id);
    if (!product) {
      return next(new CustomError(404, 'Product not found'));
    }

    if (!req.userId) {
      return next(new CustomError(403, 'Please login to remove product from wishlist'));
    }

    const user: IUser | null = await User.findById(req.userId);
    if (!user?.wishlist.includes(id)) {
      return next(new CustomError(400, 'Product not in wishlist'));
    }

    user.wishlist = user.wishlist.filter((productId: string) => productId !== id);
  }
}
