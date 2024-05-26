import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/environment';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  userType: { type: String, enum: ['Buyer', 'Seller'], default: 'Buyer' },
  buyerId: {type: String, required: false},
  sellerId: {type: String, required: false},
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
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
