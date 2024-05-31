import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  state: string;
  userType: 'Buyer' | 'Seller';
  wishlist: string[];
  location: {
    type: string;
    coordinates: number[];
  };
  resetToken?: string;
  resetTokenExpiry?: Date;
  passwordUpdatedAt?: Date;
  desc?: string;
  img?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  getSignedJwtToken(): string;
}
