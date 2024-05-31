import { Schema, model } from 'mongoose';

const reviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, enum: [0, 1, 2, 3, 4, 5] },
  comment: { type: String, required: true },
  editHistory: [{ rating: Number, comment: String, editedAt: Date }]
}, {
  timestamps: true
});

export default model('Review', reviewSchema);
