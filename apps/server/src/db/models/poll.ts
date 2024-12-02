import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { Schema } from 'mongoose';
import { mongoIdZod } from '../common-schemas';

// Zod schema for Poll creation
export const pollCreateZodSchema = z
  .object({
    title: z.string().min(1, { message: 'Title is required' }).max(500),
    description: z.string().min(1, { message: 'Description is required' }).max(500),
    imageURL: z.string().optional(),
    user_proposed_poll_id: mongoIdZod.optional(),
    total_coins_assigned: z.number().int().min(1, { message: 'Total coins must be at least 1' }),
    coins_rewarded_per_poll: z
      .number()
      .int()
      .min(1, { message: 'Coins rewarded per poll must be at least 1' })
      .max(5, { message: 'Coins rewarded per poll cannot exceed 5' }),
    energy_reduced_per_poll: z.number().int().nonnegative({ message: 'Energy reduced per poll cannot be negative' }),
    keywords: z
      .array(z.string().min(1))
      .refine((keywords) => new Set(keywords).size === keywords.length, {
        message: 'Keywords must be unique',
      })
      .optional(), // Allow the array to be empty
    options: z
      .array(
        z.object({
          value: z.string().min(1, { message: 'Option value is required' }),
          opinionShifts: z
            .array(
              z.object({
                opinion_id: mongoIdZod.min(1, { message: 'Opinion ID is required' }),
                shift: z.enum(['positive', 'negative', 'neutral'], { message: 'Invalid shift value' }),
              })
            )
            .refine((shifts) => new Set(shifts.map((shift) => shift.opinion_id)).size === shifts.length, {
              message: 'Opinion IDs within an option must be unique',
            }),
        })
      )
      .min(2, { message: 'At least 2 options are required' })
      .max(4, { message: 'No more than 4 options are allowed' }),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.total_coins_assigned % data.coins_rewarded_per_poll !== 0) {
      ctx.addIssue({
        path: ['total_coins_assigned'],
        message: 'Total coins assigned must be a multiple of coins rewarded per poll',
        code: 'custom',
      });
    }
  });
export const pollDeleteSchema = z.object({
  pollIds: z.array(mongoIdZod).refine((ids) => new Set(ids).size === ids.length, {
    message: 'Poll IDs must be unique.',
  }),
});

// Define the TypeScript type for Poll
export type PollCreateType = z.infer<typeof pollCreateZodSchema>;

// Create Mongoose schema for Poll
const pollSchema = createSchema<IBaseDocument>({
  createdByAdmin_Id: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageURL: { type: String, default: null },
  user_proposed_poll_id: { type: Schema.Types.ObjectId, ref: 'UserProposedPoll', default: null },
  total_coins_assigned: { type: Number, required: true, min: 1 },
  coins_remaining: { type: Number, required: true },
  coins_rewarded_per_poll: { type: Number, required: true, min: 1, max: 5, default: 1 },
  energy_reduced_per_poll: { type: Number, required: true, min: 0 },
  keywordFamilies: [{ type: Schema.Types.ObjectId, ref: 'KeywordFamily' }], // New field for related keyword families
  archivedAt: { type: Date, default: null },
});

// Export the Poll model
export const PollModel = createModel<IBaseDocument>('Poll', pollSchema);
