import { Schema } from 'mongoose';
import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { mongoIdZod } from '../common-schemas';

// Zod schema for OptionOpinionShift validation
export const optionOpinionShiftZodSchema = z
  .object({
    option_id: mongoIdZod,
    opinion_id: mongoIdZod,
    shift: z.enum(['positive', 'negative', 'neutral']),
    archivedAt: z.date().nullable().default(null),
  })
  .strict();

export const optionOpinionShiftCreateSchema = optionOpinionShiftZodSchema.pick({
  option_id: true,
  opinion_id: true,
  shift: true,
});

export type OptionOpinionShiftCreateType = z.infer<typeof optionOpinionShiftCreateSchema>;

export type IOptionOpinionShift = z.infer<typeof optionOpinionShiftZodSchema> & IBaseDocument;

// Mongoose schema for OptionOpinionShift
const optionOpinionShiftSchema = createSchema<IOptionOpinionShift>({
  option_id: { type: Schema.Types.ObjectId, ref: 'Option', required: true, uniqueCombination: true },
  opinion_id: { type: Schema.Types.ObjectId, ref: 'Opinion', required: true, uniqueCombination: true },
  shift: { type: String, enum: ['positive', 'negative', 'neutral'], required: true },
});

export const OptionOpinionShiftModel = createModel<IOptionOpinionShift>('OptionOpinionShift', optionOpinionShiftSchema);
