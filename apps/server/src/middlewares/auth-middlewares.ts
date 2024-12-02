import { getCookie } from 'hono/cookie';
import { ApiResponse } from '@/utils/ApiResponse';
import jwt from 'jsonwebtoken';
import { createFactory } from 'hono/factory';
import { cookieStrings } from '@/constants';

export const factory = createFactory();
export const adminAuthMiddleware = factory.createMiddleware(async (c, next) => {
  const accessToken = getCookie(c, cookieStrings.adminLoginAccessToken);
  if (!accessToken) {
    return c.json(new ApiResponse(401, null, 'Unauthorized'), 401);
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.ADMIN_JWT_SECRET!) as { adminId: string };
    c.set('adminId', decoded.adminId); // Attach `adminId` to context for downstream handlers
    await next();
  } catch (error) {
    return c.json(new ApiResponse(403, null, 'Unauthorized. Invalid access token.'), 403);
  }
});

export const userAuthMiddleware = factory.createMiddleware(async (c, next) => {
  const accessToken = getCookie(c, cookieStrings.userLoginAccessToken);
  if (!accessToken) {
    return c.json(new ApiResponse(401, null, 'Unauthorized'), 401);
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.USER_JWT_SECRET!) as { userId: string };
    c.set('userId', decoded.userId); // Attach `userId` to context for downstream handlers
    await next();
  } catch (error) {
    return c.json(new ApiResponse(403, null, 'Unauthorized. Invalid access token.'), 403);
  }
});

export const unifiedMiddleware = factory.createMiddleware(async (c, next) => {
  const adminAccessToken = getCookie(c, cookieStrings.adminLoginAccessToken);
  const userAccessToken = getCookie(c, cookieStrings.userLoginAccessToken);

  if (!adminAccessToken && !userAccessToken) {
    return c.json(new ApiResponse(401, null, 'Unauthorized. No valid credentials found.'), 401);
  }

  try {
    if (adminAccessToken) {
      const decodedAdmin = jwt.verify(adminAccessToken, process.env.ADMIN_JWT_SECRET!) as { adminId: string };
      c.set('adminId', decodedAdmin.adminId); // Attach `adminId` to context for downstream handlers
    } else if (userAccessToken) {
      const decodedUser = jwt.verify(userAccessToken, process.env.USER_JWT_SECRET!) as { userId: string };
      c.set('userId', decodedUser.userId); // Attach `userId` to context for downstream handlers
    }
    await next();
  } catch (error) {
    return c.json(new ApiResponse(403, null, 'Unauthorized. Invalid access token.'), 403);
  }
});
