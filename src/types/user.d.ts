import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  state: string;
  userType: 'Buyer' | 'Seller';
  wishlist: Array<string>;
  resetToken?: string;
  resetTokenExpiry?: Date;
  passwordUpdatedAt?: Date;
  desc?: string;
  img?: string;
  isVerified: boolean;
  comparePassword(password: string): Promise<boolean>;
  getSignedJwtToken(): string;
}
