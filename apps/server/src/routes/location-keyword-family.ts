import { createLocationKeywordFamily, deleteLocationKeywordFamily } from '@/controllers/location-keyword-family.controller';
import { locationKeywordFamilyCreateSchema } from '@/db/models';
import { adminAuthMiddleware } from '@/middlewares';
import { zJsonValidator } from '@/utils/zValidators';
import { Hono } from 'hono';

export const locationKeywordFamilyRouter = new Hono();

locationKeywordFamilyRouter.post('/', adminAuthMiddleware, zJsonValidator(locationKeywordFamilyCreateSchema), createLocationKeywordFamily);
locationKeywordFamilyRouter.delete('/', adminAuthMiddleware, zJsonValidator(locationKeywordFamilyCreateSchema), deleteLocationKeywordFamily);
