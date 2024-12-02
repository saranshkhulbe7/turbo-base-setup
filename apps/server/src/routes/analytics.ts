import { getOpinionDistribution } from '@/controllers/analytics.controller';
import { opinionDistributionSchema } from '@/db/common-schemas';
import { adminAuthMiddleware } from '@/middlewares';
import { zJsonValidator } from '@/utils/zValidators';
import { Hono } from 'hono';

export const analyticsRouter = new Hono();

analyticsRouter.post('/distribution-single', adminAuthMiddleware, zJsonValidator(opinionDistributionSchema), getOpinionDistribution);
