import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { mongoIdZod } from '../common-schemas';

// Zod schema for Opinion
export const opinionZodSchema = z
  .object({
    statement: z.string().min(1, { message: 'Statement is required' }),
  })
  .strict();

// Define schemas for Create and Update operations
export const opinionCreateSchema = opinionZodSchema.pick({
  statement: true,
});

export const opinionUpdateSchema = opinionCreateSchema.partial();

export const opinionDeleteSchema = z.object({
  opinionIds: z.array(mongoIdZod).refine((ids) => new Set(ids).size === ids.length, {
    message: 'Opinion IDs must be unique.',
  }),
});

export type OptionCreateType = z.infer<typeof opinionCreateSchema>;
export type OptionUpdateType = z.infer<typeof opinionUpdateSchema>;

// Define the type for Opinion
export type IOpinion = z.infer<typeof opinionZodSchema> & IBaseDocument;

// Create Mongoose schema for Opinion
const opinionSchema = createSchema<IOpinion>({
  statement: { type: String, required: true, uniqueCombination: true },
});

// Create and export the Opinion model
export const OpinionModel = createModel<IOpinion>('Opinion', opinionSchema);
