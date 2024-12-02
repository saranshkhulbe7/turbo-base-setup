import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { mongoIdZod } from '../common-schemas';

export const keywordFamilyZodSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    archivedAt: z.date().nullable().default(null),
  })
  .strict();

export const keywordFamilyDeleteSchema = z.object({
  keywordFamilyIds: z.array(mongoIdZod).refine((ids) => new Set(ids).size === ids.length, {
    message: 'Keyword Family IDs must be unique.',
  }),
});

export const keywordFamilyCreateSchema = keywordFamilyZodSchema.pick({
  name: true,
});

export const keywordFamilyUpdateSchema = keywordFamilyCreateSchema.partial();

export type KeywordFamilyCreateType = z.infer<typeof keywordFamilyCreateSchema>;
export type KeywordFamilyUpdateType = z.infer<typeof keywordFamilyUpdateSchema>;

export type IKeywordFamily = z.infer<typeof keywordFamilyZodSchema> & IBaseDocument;

const keywordFamilySchema = createSchema<IKeywordFamily>({
  name: { type: String, required: true, uniqueCombination: true },
});

export const KeywordFamilyModel = createModel<IKeywordFamily>('KeywordFamily', keywordFamilySchema);
