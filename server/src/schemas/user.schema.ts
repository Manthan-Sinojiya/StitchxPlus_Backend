import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Must be a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.enum(['admin', 'customer']).optional(),
    phone: z.string().optional(),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID parameter is required'),
  }),
});
