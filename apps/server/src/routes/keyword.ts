import { createKeyword, deleteKeywords, getAllKeywords, getKeywordById, updateKeyword } from '@/controllers/keyword.controller';
import { zodIdSchema } from '@/db/common-schemas';
import { keywordCreateSchema, keywordDeleteSchema, keywordUpdateSchema } from '@/db/models';
import { adminAuthMiddleware } from '@/middlewares';
import { zJsonValidator, zParamsValidator } from '@/utils/zValidators';
import { Hono } from 'hono';

export const keywordRouter = new Hono();

keywordRouter.get('/', adminAuthMiddleware, getAllKeywords);
keywordRouter.get('/:_id', adminAuthMiddleware, zParamsValidator(zodIdSchema), getKeywordById);
keywordRouter.post('/', adminAuthMiddleware, zJsonValidator(keywordCreateSchema), createKeyword);
keywordRouter.patch('/:_id', adminAuthMiddleware, zJsonValidator(keywordUpdateSchema), zParamsValidator(zodIdSchema), updateKeyword);
keywordRouter.delete('/', adminAuthMiddleware, zJsonValidator(keywordDeleteSchema), deleteKeywords);
