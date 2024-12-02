import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { Schema } from 'mongoose';

// Zod Schema for User
export const userZodSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email format' }),
    avatar: z.string().nullable().default(null),
    bgColor: z.enum(['red', 'blue', 'white']).nullable().default(null),
    coins: z.number().nonnegative().default(50),
    energy: z.number().nonnegative().default(50),
    level: z.number().int().positive().default(1),
    location: z.string().nullable().default(null),
    archivedAt: z.date().nullable().default(null),
    refreshToken: z.string().nullable().default(null),
  })
  .strict();

export const userCreateSchema = userZodSchema.pick({
  name: true,
  email: true,
});

export const userLoginInputSchema = userZodSchema.pick({
  email: true,
});

export const userUpdateLocationSchema = z.object({
  locationId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid location ID format' }),
});

export const userUpdateBgColorSchema = z.object({
  bgColor: z.enum(['red', 'blue', 'white'], { message: 'Invalid bgColor value. The value can only be "red", "blue" or "white"' }),
});

// Define the type for User
export type IUser = z.infer<typeof userZodSchema> & IBaseDocument;

const userSchema = createSchema<IUser>({
  name: { type: String, required: true, uniqueCombination: true },
  email: { type: String, required: true, uniqueCombination: true },
  avatar: { type: Schema.Types.ObjectId, ref: 'Avatar', default: null },
  bgColor: { type: String, enum: ['red', 'blue', 'white'], default: null },
  coins: { type: Number, required: true, default: 50 },
  energy: { type: Number, required: true, default: 100 },
  level: { type: Number, required: true, default: 1 },
  location: { type: Schema.Types.ObjectId, ref: 'Location', default: null },
  refreshToken: { type: String, default: null },
});

export const UserModel = createModel<IUser>('User', userSchema);
