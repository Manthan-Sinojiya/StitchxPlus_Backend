import { Schema, model, Document, Types } from 'mongoose';

export interface IReviewDocument extends Document {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export const ReviewModel = model<IReviewDocument>('Review', reviewSchema);
