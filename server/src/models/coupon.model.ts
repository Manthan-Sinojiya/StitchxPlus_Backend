import { Schema, model, Document } from 'mongoose';

export interface ICouponDocument extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate?: Date;
  expiresAt?: Date;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number;
  perUserLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number },
    startDate: { type: Date },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0, min: 0 },
    usageLimit: { type: Number },
    perUserLimit: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  },
);

export const CouponModel = model<ICouponDocument>('Coupon', couponSchema);
