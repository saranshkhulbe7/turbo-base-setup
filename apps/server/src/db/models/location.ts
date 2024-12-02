import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { mongoIdZod } from '../common-schemas';

// Zod Schema for Location validation
export const locationZodSchema = z
  .object({
    name: z.string().min(1, { message: 'Location name is required' }),
    imageUrl: z.string().url({ message: 'Invalid URL format' }),
    archivedAt: z.date().nullable().default(null),
  })
  .strict();

export const locationCreateSchema = locationZodSchema.pick({
  name: true,
  imageUrl: true,
});

export const locationUpdateSchema = locationCreateSchema.partial();

export const locationDeleteSchema = z.object({
  locationIds: z.array(mongoIdZod).refine((ids) => new Set(ids).size === ids.length, {
    message: 'Location IDs must be unique.',
  }),
});

export type LocationCreateType = z.infer<typeof locationCreateSchema>;
export type LocationUpdateType = z.infer<typeof locationUpdateSchema>;

// Define the type for Location
export type ILocation = z.infer<typeof locationZodSchema> & IBaseDocument;

// Create Mongoose schema for Location
const locationSchema = createSchema<ILocation>({
  name: { type: String, required: true, uniqueCombination: true },
  imageUrl: { type: String, required: true },
});

export const LocationModel = createModel<ILocation>('Location', locationSchema);
