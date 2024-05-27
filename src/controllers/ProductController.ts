import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import CustomError from '../utils/customError';
import Product from '../models/productModel';
import User from '../models/userModel';
import { IProduct } from '../types';

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

  // DELETE /api/products/:id - Delete a product
  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<Response | void>{
    const { id } = req.params;
    
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
}
