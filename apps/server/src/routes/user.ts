import { Hono } from 'hono';
import { zJsonValidator } from '@/utils/zValidators';
import {
  getMyDetails,
  initiateSignup,
  updateUserBgColor,
  updateUserLocation,
  userLoginInitiate,
  userLoginVerify,
  userLogout,
  userRefreshToken,
  validateUserToken,
  verifySignup,
} from '@/controllers/user.controller';
import { userCreateSchema, userLoginInputSchema, userUpdateBgColorSchema, userUpdateLocationSchema } from '@/db/models';
import { z } from 'zod';
import { userAuthMiddleware } from '@/middlewares';
import { otpZodSchema } from '@/db/common-schemas';

export const userRouter = new Hono();

userRouter.get('/my-details', userAuthMiddleware, getMyDetails);
userRouter.get('/validate-user-token', userAuthMiddleware, validateUserToken);
userRouter.post('/signup/initiate', zJsonValidator(userCreateSchema), initiateSignup);
userRouter.post('/signup/verify', zJsonValidator(z.object({ otp: otpZodSchema })), verifySignup);
userRouter.post('/login/initiate', zJsonValidator(userLoginInputSchema), userLoginInitiate);
userRouter.post('/login/verify', zJsonValidator(z.object({ otp: otpZodSchema })), userLoginVerify);
userRouter.post('/refresh-token', userRefreshToken);
userRouter.post('/logout', userAuthMiddleware, userLogout);
userRouter.patch('/location', userAuthMiddleware, zJsonValidator(userUpdateLocationSchema), updateUserLocation);
userRouter.patch('/bg-color', userAuthMiddleware, zJsonValidator(userUpdateBgColorSchema), updateUserBgColor);
