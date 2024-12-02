import { createOpinion, deleteOpinions, getAllOpinions, getOpinionById, updateOpinion } from '@/controllers/opinion.controller';
import { zodIdSchema } from '@/db/common-schemas';
import { opinionCreateSchema, opinionDeleteSchema, opinionUpdateSchema } from '@/db/models';
import { adminAuthMiddleware } from '@/middlewares';
import { zJsonValidator, zParamsValidator } from '@/utils/zValidators';
import { Hono } from 'hono';

export const opinionRouter = new Hono();

opinionRouter.get('/', adminAuthMiddleware, getAllOpinions);
opinionRouter.get('/:_id', adminAuthMiddleware, zParamsValidator(zodIdSchema), getOpinionById);
opinionRouter.post('/', adminAuthMiddleware, zJsonValidator(opinionCreateSchema), createOpinion);
opinionRouter.patch('/:_id', adminAuthMiddleware, zJsonValidator(opinionUpdateSchema), zParamsValidator(zodIdSchema), updateOpinion);
opinionRouter.delete('/', adminAuthMiddleware, zJsonValidator(opinionDeleteSchema), deleteOpinions);
