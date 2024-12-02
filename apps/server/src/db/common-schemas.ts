import { z } from 'zod';

export const mongoIdZod = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid ID format' });
export const zodIdSchema = z.object({
  _id: mongoIdZod,
});
// Reusable OTP Validation Schema
export const otpZodSchema = z
  .string()
  .length(6, { message: 'OTP must be exactly 6 characters' }) // Ensure OTP is exactly 6 characters
  .regex(/^\d{6}$/, { message: 'OTP must be numeric' }); // Ensure OTP is numeric

export const opinionDistributionSchema = z.object({
  opinionId: mongoIdZod, // Opinion ID is required
  keywordFamilyIds: z.array(mongoIdZod).nonempty({ message: 'Keyword Family IDs must not be empty' }), // At least one keyword family ID
  filters: z
    .object({
      user_id: mongoIdZod.optional(), // Optional user_id for filtering
    })
    .optional(), // filters object itself is optional
});
export const adminLoginZodSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email format' }),
    otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
    otpExpiresAt: z.date(),
  })
  .strict();
export const adminLoginInputSchema = adminLoginZodSchema.pick({
  email: true,
});
