import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { Schema } from 'mongoose';
import { mongoIdZod } from '../common-schemas';

// Zod Schema for Interaction creation
export const interactionCreateZodSchema = z.object({
  poll_id: mongoIdZod,
  option_id: mongoIdZod.nullable(),
});

export type InteractionCreateType = z.infer<typeof interactionCreateZodSchema>;

// Define Mongoose schema for Interaction
const interactionSchema = createSchema<IBaseDocument>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, uniqueCombination: true },
  poll_id: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, uniqueCombination: true },
  option_id: { type: Schema.Types.ObjectId, ref: 'Option', default: null },
  coinsGained: { type: Number, default: 0 },
  energySpent: { type: Number, default: 0 },
  archivedAt: { type: Date, default: null },
});

// Enforce unique combination of `user_id` and `poll_id`
// interactionSchema.index({ user_id: 1, poll_id: 1 }, { unique: true });

export const InteractionModel = createModel<IBaseDocument>('Interaction', interactionSchema);
