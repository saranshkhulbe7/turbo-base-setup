import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { Schema } from 'mongoose';
import { mongoIdZod } from '../common-schemas';

// Zod schema for PollKeyword
export const pollKeywordZodSchema = z
  .object({
    poll_id: mongoIdZod.min(1, { message: 'Poll ID is required' }),
    keyword_id: mongoIdZod.min(1, { message: 'Keyword ID is required' }),
    isArchived: z.boolean().default(false),
  })
  .strict();

// Define schemas for Create operations
export const pollKeywordCreateSchema = pollKeywordZodSchema.pick({
  poll_id: true,
  keyword_id: true,
});

export type PollKeywordCreateType = z.infer<typeof pollKeywordCreateSchema>;

// Define the type for PollKeyword
export type IPollKeyword = z.infer<typeof pollKeywordZodSchema> & IBaseDocument;

// Create Mongoose schema for PollKeyword
const pollKeywordSchema = createSchema<IPollKeyword>({
  poll_id: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, uniqueCombination: true },
  keyword_id: { type: Schema.Types.ObjectId, ref: 'Keyword', required: true, uniqueCombination: true },
  isArchived: { type: Boolean, default: false },
});

// Create and export the PollKeyword model
export const PollKeywordModel = createModel<IPollKeyword>('PollKeyword', pollKeywordSchema);
