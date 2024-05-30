import { Document, Types } from 'mongoose';

export interface IReview implements Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  editHistory: { rating: number, comment: string, editedAt: Date }[];
}
