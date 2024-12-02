import { Hono } from 'hono';
import { zJsonValidator, zParamsValidator } from '@/utils/zValidators';
import { userProposedPollZodSchema } from '@/db/models/user-proposed-poll';
import { createProposedPoll, getAllUserProposedPolls, getUserProposedPollById } from '@/controllers/user-proposed-poll.controller';
import { userAuthMiddleware } from '@/middlewares';
import { zodIdSchema } from '@/db/common-schemas';

export const userProposedPollRouter = new Hono();
userProposedPollRouter.post(
  '/',
  userAuthMiddleware,
  zJsonValidator(userProposedPollZodSchema.pick({ title: true, description: true, imageURL: true, options: true, totalCoinsProposed: true })),
  createProposedPoll
);
userProposedPollRouter.get('/', userAuthMiddleware, getAllUserProposedPolls);
userProposedPollRouter.get('/:_id', userAuthMiddleware, zParamsValidator(zodIdSchema), getUserProposedPollById);
