import { describe, it, expect } from 'vitest';

// 1. Pricing Calculation Logic
export function calculateCustomizationPrice(
  basePrice: number,
  options: { priceAdjustment: number }[],
): number {
  if (basePrice < 0) throw new Error('Base price cannot be negative');
  const adjustments = options.reduce((sum, opt) => sum + (opt.priceAdjustment || 0), 0);
  return Math.max(0, basePrice + adjustments);
}

// 2. Coupon Discount Calculation & Validation Logic
export interface CouponRule {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  expiresAt?: Date;
  isActive: boolean;
}

export function applyCoupon(
  subtotal: number,
  coupon: CouponRule,
): { discount: number; finalTotal: number } {
  if (!coupon.isActive) {
    throw new Error('Coupon code is inactive');
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new Error('Coupon code has expired');
  }
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    throw new Error(`Minimum order amount of $${coupon.minOrderValue} required for this coupon`);
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((subtotal * (coupon.discountValue / 100)) * 100) / 100;
  } else {
    discount = Math.min(subtotal, coupon.discountValue);
  }

  const finalTotal = Math.max(0, subtotal - discount);
  return { discount, finalTotal };
}

// 3. Order Status Transition State Machine
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['IN_PRODUCTION', 'CANCELLED', 'REFUNDED'],
  IN_PRODUCTION: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export function validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  if (currentStatus === newStatus) return true;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

describe('Unit Tests: Pricing Engine', () => {
  it('calculates total price with positive and premium customization adjustments', () => {
    const basePrice = 850;
    const options = [
      { priceAdjustment: 50 },  // Peak Lapel
      { priceAdjustment: 120 }, // Loro Piana Lining
      { priceAdjustment: 30 },  // Horn Buttons
    ];
    const total = calculateCustomizationPrice(basePrice, options);
    expect(total).toBe(1050);
  });

  it('handles negative price adjustments correctly', () => {
    const basePrice = 850;
    const options = [
      { priceAdjustment: -50 }, // Standard Polyester Lining discount
      { priceAdjustment: 20 },
    ];
    const total = calculateCustomizationPrice(basePrice, options);
    expect(total).toBe(820);
  });

  it('prevents total price from dropping below zero', () => {
    const basePrice = 100;
    const options = [{ priceAdjustment: -200 }];
    const total = calculateCustomizationPrice(basePrice, options);
    expect(total).toBe(0);
  });

  it('throws error if base price is negative', () => {
    expect(() => calculateCustomizationPrice(-10, [])).toThrow('Base price cannot be negative');
  });
});

describe('Unit Tests: Coupon Engine', () => {
  const activePercentageCoupon: CouponRule = {
    code: 'BESPOKE15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 500,
    isActive: true,
  };

  const activeFixedCoupon: CouponRule = {
    code: 'GENT100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 300,
    isActive: true,
  };

  it('applies percentage coupon correctly', () => {
    const res = applyCoupon(1000, activePercentageCoupon);
    expect(res.discount).toBe(150);
    expect(res.finalTotal).toBe(850);
  });

  it('applies fixed dollar amount coupon correctly', () => {
    const res = applyCoupon(500, activeFixedCoupon);
    expect(res.discount).toBe(100);
    expect(res.finalTotal).toBe(400);
  });

  it('rejects coupon when minimum order value is not met', () => {
    expect(() => applyCoupon(400, activePercentageCoupon)).toThrow(
      'Minimum order amount of $500 required for this coupon',
    );
  });

  it('rejects inactive coupon', () => {
    const inactive: CouponRule = { ...activePercentageCoupon, isActive: false };
    expect(() => applyCoupon(1000, inactive)).toThrow('Coupon code is inactive');
  });

  it('rejects expired coupon', () => {
    const expired: CouponRule = {
      ...activePercentageCoupon,
      expiresAt: new Date('2020-01-01'),
    };
    expect(() => applyCoupon(1000, expired)).toThrow('Coupon code has expired');
  });
});

describe('Unit Tests: Order Status Transition Machine', () => {
  it('allows valid forward status transitions', () => {
    expect(validateStatusTransition('PENDING_PAYMENT', 'PAID')).toBe(true);
    expect(validateStatusTransition('PAID', 'PROCESSING')).toBe(true);
    expect(validateStatusTransition('PROCESSING', 'IN_PRODUCTION')).toBe(true);
    expect(validateStatusTransition('IN_PRODUCTION', 'SHIPPED')).toBe(true);
    expect(validateStatusTransition('SHIPPED', 'DELIVERED')).toBe(true);
  });

  it('allows cancellation from applicable active statuses', () => {
    expect(validateStatusTransition('PENDING_PAYMENT', 'CANCELLED')).toBe(true);
    expect(validateStatusTransition('PAID', 'CANCELLED')).toBe(true);
    expect(validateStatusTransition('IN_PRODUCTION', 'CANCELLED')).toBe(true);
  });

  it('rejects invalid backward or illegal status transitions', () => {
    expect(validateStatusTransition('DELIVERED', 'PENDING_PAYMENT')).toBe(false);
    expect(validateStatusTransition('SHIPPED', 'PROCESSING')).toBe(false);
    expect(validateStatusTransition('CANCELLED', 'PAID')).toBe(false);
    expect(validateStatusTransition('REFUNDED', 'IN_PRODUCTION')).toBe(false);
  });
});
