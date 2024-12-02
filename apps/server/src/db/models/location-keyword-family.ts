import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { mongoIdZod } from '../common-schemas';

// Zod schema for LocationKeywordFamily validation
export const locationKeywordFamilyZodSchema = z
  .object({
    location_id: mongoIdZod.min(1, { message: 'Location ID is required' }),
    keyword_family_id: mongoIdZod.min(1, { message: 'Keyword Family ID is required' }),
    archivedAt: z.date().nullable().default(null),
  })
  .strict();

export const locationKeywordFamilyCreateSchema = locationKeywordFamilyZodSchema.pick({
  location_id: true,
  keyword_family_id: true,
});

export type LocationKeywordFamilyCreateType = z.infer<typeof locationKeywordFamilyCreateSchema>;
export type ILocationKeywordFamily = z.infer<typeof locationKeywordFamilyZodSchema> & IBaseDocument;

// Mongoose schema for LocationKeywordFamily
const locationKeywordFamilySchema = createSchema<ILocationKeywordFamily>({
  location_id: { type: String, required: true, ref: 'Location', uniqueCombination: true },
  keyword_family_id: { type: String, required: true, ref: 'KeywordFamily', uniqueCombination: true },
});

export const LocationKeywordFamilyModel = createModel<ILocationKeywordFamily>('LocationKeywordFamily', locationKeywordFamilySchema);
