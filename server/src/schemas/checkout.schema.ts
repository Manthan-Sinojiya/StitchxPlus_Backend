import { z } from 'zod';

export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  street: z.string().min(1, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Valid email address is required'),
});

export const createPaymentSchema = z.object({
  body: z.object({
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    shippingMethod: z.string().optional(),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    orderNumber: z.string().optional(),
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    shippingMethod: z.string().optional(),
    paymentMethod: z.string().optional(),
    paymentIntentId: z.string().optional(),
  }),
});
