import { Document } from 'mongoose';

export interface IProduct extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  userId: Schema.Types.ObjectId;
  category: string;
  description: string;
  price: number;
  negotiable: boolean;
  images: string[];
  ratings: number[];
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  addReview(rating: number): Promise<IProduct>;
  seller?: IUser;
}
