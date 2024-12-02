import { Hono } from 'hono';
import { zJsonValidator, zParamsValidator } from '@/utils/zValidators';
import { createComment, deleteComment, getCommentsByPoll } from '@/controllers/comment.controller';
import { commentCreateSchema } from '@/db/models';
import { userAuthMiddleware } from '@/middlewares';
import { zodIdSchema } from '@/db/common-schemas';

export const commentRouter = new Hono();

commentRouter.post('/', userAuthMiddleware, zJsonValidator(commentCreateSchema), createComment);
commentRouter.delete('/:_id', userAuthMiddleware, zParamsValidator(zodIdSchema), deleteComment);
commentRouter.get('/poll/:_id', userAuthMiddleware, zParamsValidator(zodIdSchema), getCommentsByPoll);
