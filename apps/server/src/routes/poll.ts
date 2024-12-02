import { Hono } from 'hono';
import { adminAuthMiddleware, userAuthMiddleware } from '@/middlewares';
import { zJsonValidator, zParamsValidator } from '@/utils/zValidators';
import { interactionCreateZodSchema, pollCreateZodSchema, pollDeleteSchema } from '@/db/models';
import { createPoll, deletePolls, getAllPolls, getPollById } from '@/controllers/poll.controller';
import { mongoIdZod } from '@/db/common-schemas';
import { createInteraction } from '@/controllers/interaction.controller';
import { z } from 'zod';

export const pollRouter = new Hono();

pollRouter.get('/', adminAuthMiddleware, getAllPolls);
pollRouter.get('/:_id', adminAuthMiddleware, zParamsValidator(z.object({ _id: mongoIdZod })), getPollById);
pollRouter.post('/', adminAuthMiddleware, zJsonValidator(pollCreateZodSchema), createPoll);
pollRouter.post('/interact', userAuthMiddleware, zJsonValidator(interactionCreateZodSchema), createInteraction);
pollRouter.delete('/', adminAuthMiddleware, zJsonValidator(pollDeleteSchema), deletePolls);
