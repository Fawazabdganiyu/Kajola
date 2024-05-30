import { Document, Types } from 'mongoose';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  userId: Types.ObjectId;
  category: string;
  description: string;
  price: string;
  negotiable: boolean;
  images: string[];
  ratings: number[];
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  addReview(rating: number): Promise<IProduct>;
  removeReview(rating: number): Promise<IProduct>;
  seller?: IUser;
}
