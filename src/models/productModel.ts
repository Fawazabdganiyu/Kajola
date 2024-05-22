import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  negotiable: {
    type: Boolean,
    default: true,
  },
  ratings: [{
    type: Number,
    enum: [0, 1, 2, 3, 4, 5],
  }],
  averageRating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  desc: String,
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.methods.addReview = function (rating: number) {
  // Add the new rating to the ratings array
  this.ratings.push(rating);

  // Increment the reviewCount
  this.reviewCount += 1;

  // Calculate the new averageRating
  const sum = this.ratings.reduce((acc: number, curr: number) => acc + curr, 0);
  this.averageRating = sum / this.ratings.length;

  // Save the updated product
  return this.save();
};

export default model('Product', productSchema);
