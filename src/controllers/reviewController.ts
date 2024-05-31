import { Request, Response, NextFunction } from 'express';


import CustomError from '../utils/customError';
import Product from '../models/productModel';
import Review from '../models/reviewModel';
import mongoose, { mongo } from 'mongoose';
import { IReview } from '../types';


export default class ReviewController {
// POST /api/reviews - Post a new review
  static async createReview(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { productId, rating, comment } = req.body;
    const userId = req.userId;


    // Validate input
    if (!productId) return next(new CustomError(400, 'Product id is missing'));
    if (!rating) return next(new CustomError(400, 'Rating is missing'));
    if (!comment) return next(new CustomError(400, 'Comment is missing'));


    // Check if the user has already reviewed the product
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) return next(new CustomError(400, 'You have already reviewed this product'));

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) return next(new CustomError(404, 'Product not found'));

    try {
        const newReview = await Review.create({
        productId, userId, rating, comment
      });

      // Add review rating to product
      await product.addReview(rating);
      res.status(201).json(newReview.toObject());
    } catch (error: any) {
      next(new CustomError(500, 'Failed to create review'));
    }
  }

  // PUT /api/reviews/:id - Update a review
  static async updateReview(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;


    if (!mongoose.Types.ObjectId.isValid(id)) return next(new CustomError(400, 'Invalid review id'));

    // Check if the review exists
    const review = await Review.findById(id);
    if (!review) return next(new CustomError(404, 'Review not found'));

    // Check if the user is the review owner
    if (review.userId.toString() !== userId?.toString()) return next(new CustomError(403, 'Not authorized to update review'));

    // Update review rating in product
    const product = await Product.findById(review.productId);
    if (!product) return next(new CustomError(404, 'Product not found'));

    // Remove previous review rating from product
    await product.removeReview(review.rating);


    // Update review
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.editHistory.push({ rating: review.rating, comment: review.comment, editedAt: new Date() });

    try {
      await review.save();
      res.status(200).json(review.toObject());
    } catch (error: any) {
      next(new CustomError(500, 'Failed to update review'));
    }
  }
}
