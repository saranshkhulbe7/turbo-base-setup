import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { Schema } from 'mongoose';
import { mongoIdZod } from '../common-schemas';

// Zod schema for UserKeywordFamilyWeight
export const userKeywordFamilyWeightZodSchema = z
  .object({
    user_id: mongoIdZod.min(1, { message: 'User ID is required' }),
    keyword_family_id: mongoIdZod.min(1, { message: 'Keyword Family ID is required' }),
    weight: z.number().nonnegative().default(0),
  })
  .strict();

// Define schemas for Create and Update operations
export const userKeywordFamilyWeightCreateSchema = userKeywordFamilyWeightZodSchema.pick({
  user_id: true,
  keyword_family_id: true,
  weight: true,
});

export const userKeywordFamilyWeightUpdateSchema = userKeywordFamilyWeightCreateSchema.partial();

// Define the type for UserKeywordFamilyWeight
export type IUserKeywordFamilyWeight = z.infer<typeof userKeywordFamilyWeightZodSchema> & IBaseDocument;

export type UserKeywordFamilyWeightCreate = z.infer<typeof userKeywordFamilyWeightCreateSchema>;

// Create Mongoose schema for UserKeywordFamilyWeight
const userKeywordFamilyWeightSchema = createSchema<IUserKeywordFamilyWeight>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, uniqueCombination: true },
  keyword_family_id: { type: Schema.Types.ObjectId, ref: 'KeywordFamily', required: true, uniqueCombination: true },
  weight: { type: Number, required: true, default: 0, min: 0 }, // `min` validator added
});

// Create and export the UserKeywordFamilyWeight model
export const UserKeywordFamilyWeightModel = createModel<IUserKeywordFamilyWeight>('UserKeywordFamilyWeight', userKeywordFamilyWeightSchema);
