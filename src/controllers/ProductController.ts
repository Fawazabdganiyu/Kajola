import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import CustomError from '../utils/customError';
import Product from '../models/productModel';
import User from '../models/userModel';
import { IProduct } from '../types';

export default class ProductController {
  // POST /products - Create a new product
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    const { name, category, description, price, negotiable } = req.body;

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
}