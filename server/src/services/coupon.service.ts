import { CouponModel, ICouponDocument } from '../models/coupon.model.js';
import { AppError } from '../utils/appError.js';

export class CouponService {
  async getCouponByCode(code: string): Promise<ICouponDocument | null> {
    return CouponModel.findOne({ code: code.toUpperCase().trim() }).exec();
  }

  async validateAndCalculateDiscount(
    code: string,
    subtotal: number,
  ): Promise<{ coupon: ICouponDocument; discountAmount: number }> {
    const coupon = await this.getCouponByCode(code);
    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or inactive coupon code', 400);
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      throw new AppError('This coupon code has expired', 400);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError('This coupon code has reached its maximum usage limit', 400);
    }

    if (subtotal < coupon.minOrderValue) {
      throw new AppError(
        `Cart subtotal must be at least $${coupon.minOrderValue} to apply this coupon`,
        400,
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount does not exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return {
      coupon,
      discountAmount: Math.round(discountAmount * 100) / 100,
    };
  }
}
