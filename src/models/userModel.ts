import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/environment';
import { IUser } from '../types';
import Product from './productModel';
import Review from './reviewModel';

const userSchema = new Schema<IUser>({
  profilePic: String,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  userType: { type: String, enum: ['Buyer', 'Seller'], default: 'Buyer' },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0], required: true },
  },
  desc: String,
  img: String,
  resetToken: String,
  resetTokenExpiry: Date,
  passwordUpdatedAt: Date,
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash the password before saving the user model
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Delete user's products with product's reviews when user is deleted
userSchema.pre<IUser>('deleteOne', { document: true, query: false }, async function(next) {
  try {
    if (this.userType === 'Seller') {
      // Get all products by the user
      const products = await Product.find({ userId: this._id });
      if (products) {
        // Delete all reviews of the products
        await Review.deleteMany({ productId: { $in: products.map(product => product._id) } });
        // Delete all products by the user
        await Product.deleteMany({ userId: this._id });
      }
      next();
    }
  } catch (error: any) {
    next(error);
  }
});

// Compare the entered password with the password in the database
userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, isVerified: this.isVerified }, env.JWT_SECRET as string, {
    expiresIn: env.JWT_EXPIRATION,
  });
};

const User = model<IUser>('User', userSchema);
export default User;
