import { Schema } from 'mongoose';
import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { mongoIdZod } from '../common-schemas';

// Zod Schema for User Proposed Poll Validation
export const userProposedPollZodSchema = z
  .object({
    user_id: mongoIdZod.min(1, { message: 'User ID is required' }).max(500),
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().min(1, { message: 'Description is required' }).max(500),
    imageURL: z.string().url({ message: 'Invalid URL' }).optional(),
    options: z
      .array(z.string().min(1, { message: 'Option cannot be empty' }))
      .min(2, { message: 'At least 2 options are required' })
      .max(4, { message: 'At most 4 options are allowed' })
      .refine((options) => new Set(options).size === options.length, { message: 'Options must be unique' }),
    totalCoinsProposed: z.number().nonnegative({ message: 'Total coins must be non-negative' }),
  })
  .strict();

export const userProposedPollCreateSchema = userProposedPollZodSchema.pick({
  title: true,
  description: true,
  imageURL: true,
  options: true,
  totalCoinsProposed: true,
});

// Define the TypeScript type for UserProposedPoll
export type IUserProposedPoll = z.infer<typeof userProposedPollZodSchema> & IBaseDocument;

// Mongoose Schema Definition
const userProposedPollSchema = createSchema<IUserProposedPoll>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageURL: { type: String, default: null },
  options: { type: [String], required: true },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  totalCoinsProposed: { type: Number, required: true, default: 0 },
});

// Pre-save hook for options validation
userProposedPollSchema.pre('save', function (next) {
  const options = this.options;
  if (options.length < 2 || options.length > 4) {
    return next(new Error('Options must have at least 2 and at most 4 entries.'));
  }
  if (new Set(options).size !== options.length) {
    return next(new Error('Options must be unique.'));
  }
  next();
});

export const UserProposedPollModel = createModel<IUserProposedPoll>('UserProposedPoll', userProposedPollSchema);
