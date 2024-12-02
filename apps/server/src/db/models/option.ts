import { Schema } from 'mongoose';
import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { mongoIdZod } from '../common-schemas';

// Zod Schema for Option validation
export const optionZodSchema = z
  .object({
    _poll_id: mongoIdZod.min(1, { message: 'Poll ID is required' }),
    value: z.string().min(1, { message: 'Option value is required' }),
    archivedAt: z.date().nullable().default(null),
  })
  .strict();

export const optionCreateSchema = optionZodSchema.pick({
  _poll_id: true,
  value: true,
});

export type OptionCreateType = z.infer<typeof optionCreateSchema>;

export type IOption = z.infer<typeof optionZodSchema> & IBaseDocument;

// Mongoose Schema for Option
const optionSchema = createSchema<IOption>({
  _poll_id: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, uniqueCombination: true },
  value: { type: String, required: true, uniqueCombination: true },
});

export const OptionModel = createModel<IOption>('Option', optionSchema);
