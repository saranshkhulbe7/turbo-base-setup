import { zJsonValidator, zParamsValidator } from '@/utils/zValidators';
import { adminAuthMiddleware } from '@/middlewares';
import { keywordFamilyRelationsBatchCreateSchema, keywordFamilyRelationsBatchDeleteSchema } from '@/db/models';
import { mongoIdZod } from '@/db/common-schemas';
import { Hono } from 'hono';
import {
  createKeywordFamilyRelations,
  deleteKeywordFamilyRelations,
  getAllKeywordFamilyRelations,
  getRelationsByFromKeywordFamily,
} from '@/controllers/keyword-family-relation.controller';
import { z } from 'zod';

export const keywordFamilyRelationRouter = new Hono();

// Get all keyword family relations
keywordFamilyRelationRouter.get('/', adminAuthMiddleware, getAllKeywordFamilyRelations);
keywordFamilyRelationRouter.get(
  '/:keywordFamilyId',
  adminAuthMiddleware,
  zParamsValidator(z.object({ keywordFamilyId: mongoIdZod })),
  getRelationsByFromKeywordFamily
);

// Create multiple relations
keywordFamilyRelationRouter.post('/', adminAuthMiddleware, zJsonValidator(keywordFamilyRelationsBatchCreateSchema), createKeywordFamilyRelations);

// Delete multiple relations
keywordFamilyRelationRouter.delete(
  '/:from_keyword_family_id',
  adminAuthMiddleware,
  zParamsValidator(z.object({ from_keyword_family_id: mongoIdZod })),
  zJsonValidator(keywordFamilyRelationsBatchDeleteSchema),
  deleteKeywordFamilyRelations
);
