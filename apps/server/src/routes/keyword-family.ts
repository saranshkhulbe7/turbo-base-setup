import {
  createKeywordFamily,
  deleteKeywordFamilies,
  getAllKeywordFamilies,
  getFamilyKeywords,
  getKeywordFamilyById,
  updateKeywordFamily,
} from '@/controllers/keyword-family.controller';
import { zodIdSchema } from '@/db/common-schemas';
import { keywordFamilyCreateSchema, keywordFamilyDeleteSchema, keywordFamilyUpdateSchema } from '@/db/models';
import { adminAuthMiddleware } from '@/middlewares';
import { zJsonValidator, zParamsValidator } from '@/utils/zValidators';
import { Hono } from 'hono';

export const keywordFamilyRouter = new Hono();

keywordFamilyRouter.get('/', adminAuthMiddleware, getAllKeywordFamilies);
keywordFamilyRouter.get('/:_id', adminAuthMiddleware, zParamsValidator(zodIdSchema), getKeywordFamilyById);
keywordFamilyRouter.get('/:_id/keywords', adminAuthMiddleware, zParamsValidator(zodIdSchema), getFamilyKeywords);
keywordFamilyRouter.post('/', adminAuthMiddleware, zJsonValidator(keywordFamilyCreateSchema), createKeywordFamily);
keywordFamilyRouter.patch(
  '/:_id',
  adminAuthMiddleware,
  zJsonValidator(keywordFamilyUpdateSchema),
  zParamsValidator(zodIdSchema),
  updateKeywordFamily
);
keywordFamilyRouter.delete('/', adminAuthMiddleware, zJsonValidator(keywordFamilyDeleteSchema), deleteKeywordFamilies);
