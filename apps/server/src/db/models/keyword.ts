import { Schema } from 'mongoose';
import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { mongoIdZod } from '../common-schemas';

// Zod schema for Keyword
export const keywordZodSchema = z
  .object({
    keywordFamily_id: mongoIdZod.min(1, { message: 'Keyword Family ID is required' }),
    value: z.string().min(1, { message: 'Value is required' }),
    archivedAt: z.date().nullable().default(null),
  })
  .strict();

// Define schemas for Create and Update operations
export const keywordCreateSchema = keywordZodSchema.pick({
  keywordFamily_id: true,
  value: true,
});

export const keywordUpdateSchema = keywordCreateSchema.partial();

export const keywordDeleteSchema = z.object({
  keywordIds: z.array(mongoIdZod).refine((keywordIds) => new Set(keywordIds).size === keywordIds.length, {
    message: 'Keyword IDs must be unique.',
  }),
});
export type KeywordCreateType = z.infer<typeof keywordCreateSchema>;
export type KeywordUpdateType = z.infer<typeof keywordUpdateSchema>;

// Define the type for Keyword
export type IKeyword = z.infer<typeof keywordZodSchema> & IBaseDocument;

// Create Mongoose schema for Keyword
const keywordSchema = createSchema<IKeyword>({
  keywordFamily_id: { type: Schema.Types.ObjectId, ref: 'KeywordFamily', required: true, uniqueCombination: true },
  value: { type: String, required: true, uniqueCombination: true },
});

// Create and export the Keyword model
export const KeywordModel = createModel<IKeyword>('Keyword', keywordSchema);
