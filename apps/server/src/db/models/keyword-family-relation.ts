import { createSchema, createModel, type IBaseDocument } from '../base';
import { Schema } from 'mongoose';
import { z } from 'zod';
import { mongoIdZod } from '../common-schemas';

// Zod schema for Keyword_Family_Relations
export const keywordFamilyRelationsZodSchema = z
  .object({
    from_keyword_family_id: mongoIdZod,
    to_keyword_family_id: mongoIdZod,
  })
  .strict();

// Define schemas for Create and Delete operations
export const keywordFamilyRelationsBatchCreateSchema = z.object({
  from_keyword_family_id: mongoIdZod,
  to_keyword_family_ids: z.array(mongoIdZod).refine((ids) => new Set(ids).size === ids.length, { message: 'Keyword Family IDs must be unique.' }),
});

export const keywordFamilyRelationsBatchDeleteSchema = z.object({
  to_keyword_family_ids: z.array(mongoIdZod).refine((ids) => new Set(ids).size === ids.length, {
    message: 'Keyword family IDs must be unique.',
  }),
});
export type KeywordFamilyRelationsDeleteType = z.infer<typeof keywordFamilyRelationsBatchDeleteSchema>;

// Define the type for Keyword_Family_Relations
export type IKeywordFamilyRelation = z.infer<typeof keywordFamilyRelationsZodSchema> & IBaseDocument;

// Create Mongoose schema for Keyword_Family_Relations
const keywordFamilyRelationSchema = createSchema<IKeywordFamilyRelation>({
  from_keyword_family_id: { type: Schema.Types.ObjectId, ref: 'KeywordFamily', required: true, uniqueCombination: true },
  to_keyword_family_id: { type: Schema.Types.ObjectId, ref: 'KeywordFamily', required: true, uniqueCombination: true },
});

// Add pre-save hook to prevent self-referencing
keywordFamilyRelationSchema.pre('save', function (next) {
  if (this.from_keyword_family_id.toString() === this.to_keyword_family_id.toString()) {
    return next(new Error('The "from" and "to" keyword families cannot be the same.'));
  }
  next();
});

// Create and export the model
export const KeywordFamilyRelationModel = createModel<IKeywordFamilyRelation>('KeywordFamilyRelation', keywordFamilyRelationSchema);
