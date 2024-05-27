import { Document } from 'mongoose';

export interface IReview implements Document {
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}