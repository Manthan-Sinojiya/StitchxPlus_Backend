import { z } from 'zod';

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1').optional().default(1),
    customization: z
      .object({
        selectedOptions: z.record(z.string(), z.string()),
        basePrice: z.number().optional(),
        totalPrice: z.number().optional(),
        optionAdjustments: z
          .array(
            z.object({
              group: z.string(),
              optionCode: z.string(),
              optionName: z.string(),
              priceAdjustment: z.number(),
            }),
          )
          .optional(),
      })
      .optional(),
    measurementProfile: z
      .object({
        id: z.string().optional(),
        name: z.string(),
        chest: z.number().optional(),
        waist: z.number().optional(),
        shoulder: z.number().optional(),
        sleeve: z.number().optional(),
        neck: z.number().optional(),
        jacketLength: z.number().optional(),
        trouserWaist: z.number().optional(),
        inseam: z.number().optional(),
        thigh: z.number().optional(),
        fitPreference: z.enum(['slim', 'regular', 'relaxed']).optional(),
        unit: z.enum(['inches', 'cm']).optional(),
      })
      .optional(),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().min(0, 'Quantity must be 0 or greater').optional(),
    customization: z
      .object({
        selectedOptions: z.record(z.string(), z.string()),
        basePrice: z.number().optional(),
        totalPrice: z.number().optional(),
      })
      .optional(),
    measurementProfile: z.object({}).passthrough().optional(),
  }),
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
  }),
});
