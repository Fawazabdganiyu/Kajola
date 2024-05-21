import { compare, hash, genSalt } from 'bcryptjs';
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['Buyer', 'Seller'],
    default: 'Buyer',
  },
  wishlist: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  resetToken: String,
  resetTokenExpiry: Date,
  passwordUpdatedAt: Date,
  desc: String,
  img: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash the password before saving the user model
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

// Compare the entered password with the password in the database
userSchema.methods.comparePassword = async function (password: string) {
  return compare(password, this.password);
};

export default model('User', userSchema);
