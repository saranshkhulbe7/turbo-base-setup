import { Hono } from 'hono';
import { adminAuthMiddleware } from '@/middlewares';
import { getOverview } from '@/controllers/overview.controller';

export const overviewRouter = new Hono();

overviewRouter.get('/', adminAuthMiddleware, getOverview);
