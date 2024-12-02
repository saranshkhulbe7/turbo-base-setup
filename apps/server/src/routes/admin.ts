import { Hono } from 'hono';
import { zJsonValidator } from '@/utils/zValidators';
import {
  adminLoginInitiate,
  adminLoginVerify,
  adminLogout,
  adminRefreshToken,
  getAdminDetails,
  getAllUsers,
  validateAdminToken,
} from '@/controllers/admin.controller';
import { z } from 'zod';
import { adminAuthMiddleware } from '@/middlewares';
import { adminLoginInputSchema, otpZodSchema } from '@/db/common-schemas';

export const adminRouter = new Hono();

adminRouter.get('/validate-admin-token', adminAuthMiddleware, validateAdminToken);
adminRouter.get('/my-details', adminAuthMiddleware, getAdminDetails);
adminRouter.get('/all-users', adminAuthMiddleware, getAllUsers);
adminRouter.post('/login/initiate', zJsonValidator(adminLoginInputSchema), adminLoginInitiate);
adminRouter.post('/login/verify', zJsonValidator(z.object({ otp: otpZodSchema })), adminLoginVerify);
adminRouter.post('/refresh-token', adminRefreshToken);
adminRouter.post('/logout', adminAuthMiddleware, adminLogout);
