import { toggleDislike, toggleLike } from '@/controllers/comment-response.controller';
import { commentResponseToggleSchema } from '@/db/models';
import { userAuthMiddleware } from '@/middlewares';
import { zJsonValidator } from '@/utils/zValidators';
import { Hono } from 'hono';

export const commentResponseRouter = new Hono();

commentResponseRouter.post('/toggle-like', userAuthMiddleware, zJsonValidator(commentResponseToggleSchema), toggleLike);
commentResponseRouter.post('/toggle-dislike', userAuthMiddleware, zJsonValidator(commentResponseToggleSchema), toggleDislike);
