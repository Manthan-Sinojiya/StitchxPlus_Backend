import { z } from 'zod';

export const createPatternSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Profile name is required').max(50, 'Name must be 50 characters or less'),
    height: z
      .number({ invalid_type_error: 'Height must be a number' })
      .min(30, 'Height must be at least 30 inches/cm')
      .max(260, 'Height must be realistic'),
    chest: z
      .number({ invalid_type_error: 'Chest measurement must be a number' })
      .min(24, 'Chest measurement must be at least 24 inches')
      .max(75, 'Chest measurement must be 75 inches or less'),
    waist: z
      .number({ invalid_type_error: 'Waist measurement must be a number' })
      .min(20, 'Waist measurement must be at least 20 inches')
      .max(70, 'Waist measurement must be 70 inches or less'),
    shoulder: z
      .number({ invalid_type_error: 'Shoulder width must be a number' })
      .min(10, 'Shoulder width must be at least 10 inches')
      .max(35, 'Shoulder width must be 35 inches or less'),
    sleeve: z
      .number({ invalid_type_error: 'Sleeve length must be a number' })
      .min(15, 'Sleeve length must be at least 15 inches')
      .max(45, 'Sleeve length must be 45 inches or less'),
    neck: z
      .number({ invalid_type_error: 'Neck size must be a number' })
      .min(10, 'Neck size must be at least 10 inches')
      .max(26, 'Neck size must be 26 inches or less'),
    jacketLength: z
      .number({ invalid_type_error: 'Jacket length must be a number' })
      .min(20, 'Jacket length must be at least 20 inches')
      .max(45, 'Jacket length must be 45 inches or less'),
    trouserWaist: z
      .number({ invalid_type_error: 'Trouser waist must be a number' })
      .min(20, 'Trouser waist must be at least 20 inches')
      .max(70, 'Trouser waist must be 70 inches or less'),
    inseam: z
      .number({ invalid_type_error: 'Inseam length must be a number' })
      .min(18, 'Inseam length must be at least 18 inches')
      .max(45, 'Inseam length must be 45 inches or less'),
    thigh: z
      .number({ invalid_type_error: 'Thigh width must be a number' })
      .min(14, 'Thigh width must be at least 14 inches')
      .max(40, 'Thigh width must be 40 inches or less'),
    fitPreference: z.enum(['slim', 'regular', 'relaxed']).optional().default('regular'),
    unit: z.enum(['inches', 'cm']).optional().default('inches'),
    isDefault: z.boolean().optional().default(false),
  }),
});

export const updatePatternSchema = z.object({
  body: createPatternSchema.shape.body.partial(),
});
