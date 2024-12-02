import { type Context } from 'hono';
import { runInTransaction } from '@/utils/transaction-helper';
import { ApiResponse } from '@/utils/ApiResponse';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import {
  getUserDetailsService,
  getUserIdFromAccessToken,
  initiateLoginService,
  initiateSignupService,
  updateUserBgColorService,
  updateUserLocationService,
  userLogoutService,
  userRefreshTokenService,
  verifyLoginService,
  verifySignupService,
} from '@/module-helpers';
import { cookieStrings } from '@/constants';
import jwt from 'jsonwebtoken';

export const validateUserToken = async (c: Context) => {
  const accessToken = getCookie(c, cookieStrings.userLoginAccessToken);
  if (!accessToken) {
    return c.json(new ApiResponse(401, null, 'Unauthorized: No token provided'), 401);
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.USER_JWT_SECRET!) as { userId: string };
    return c.json(new ApiResponse(200, { valid: true, userId: decoded.userId }, 'Token is valid.'));
  } catch (error) {
    return c.json(new ApiResponse(403, null, 'Unauthorized: Invalid token'), 403);
  }
};
export const getMyDetails = async (c: Context) => {
  const accessToken = getCookie(c, cookieStrings.userLoginAccessToken);
  if (!accessToken) throw new Error('Access token is missing.');

  const userId = getUserIdFromAccessToken(accessToken);
  const userDetails = await getUserDetailsService(userId);

  if (!userDetails) {
    return c.json(new ApiResponse(404, null, 'User details not found.'), 404);
  }

  return c.json(new ApiResponse(200, userDetails, 'User details fetched successfully.'));
};
export const initiateSignup = async (c: Context) => {
  const { name, email } = await c.req.json();
  await runInTransaction(async (session) => {
    await initiateSignupService(name, email, session);
  });
  setCookie(c, cookieStrings.userSignupName, name, { httpOnly: false, maxAge: 120 });
  setCookie(c, cookieStrings.userSignupEmail, email, { httpOnly: false, maxAge: 120 });
  return c.json(new ApiResponse(200, null, 'OTP sent successfully.'));
};

export const verifySignup = async (c: Context) => {
  const email = getCookie(c, cookieStrings.userSignupEmail);
  const name = getCookie(c, cookieStrings.userSignupName);
  const { otp } = await c.req.json();
  if (!email || !name) {
    throw new Error('Email or Name not found in cookies.');
  }
  const newUser = await runInTransaction(async (session) => {
    return verifySignupService(name, email, otp, session);
  });
  deleteCookie(c, cookieStrings.userSignupName);
  deleteCookie(c, cookieStrings.userSignupEmail);
  return c.json(new ApiResponse(201, newUser, 'User verified and created successfully.'));
};

export const userLoginInitiate = async (c: Context) => {
  const { email } = await c.req.json();
  await runInTransaction(async (session) => {
    await initiateLoginService(email, session);
  });
  setCookie(c, cookieStrings.userLoginEmail, email, { httpOnly: false, maxAge: 120 });
  return c.json(new ApiResponse(200, null, 'OTP sent successfully.'));
};

export const userLoginVerify = async (c: Context) => {
  const email = getCookie(c, cookieStrings.userLoginEmail);
  console.log('user login email is', email);
  if (!email) {
    throw new Error('Email not found in cookies.');
  }
  const { otp } = await c.req.json();
  const { accessToken, refreshToken } = await runInTransaction(async (session) => {
    return verifyLoginService(email, otp, session);
  });
  setCookie(c, cookieStrings.userLoginAccessToken, accessToken, { httpOnly: false, maxAge: 900 });
  setCookie(c, cookieStrings.userLoginRefreshToken, refreshToken, { httpOnly: false, maxAge: 86400 });
  return c.json(new ApiResponse(200, null, 'Login successful.'));
};

export const userRefreshToken = async (c: Context) => {
  const refreshToken = getCookie(c, cookieStrings.userLoginRefreshToken) ?? '';
  const { accessToken, newRefreshToken } = await userRefreshTokenService(refreshToken);
  setCookie(c, cookieStrings.userLoginAccessToken, accessToken, { httpOnly: false, maxAge: 900 });
  setCookie(c, cookieStrings.userLoginRefreshToken, newRefreshToken, { httpOnly: false, maxAge: 86400 });
  return c.json(new ApiResponse(200, null, 'Tokens refreshed successfully.'));
};

export const userLogout = async (c: Context) => {
  const refreshToken = getCookie(c, cookieStrings.userLoginRefreshToken) ?? '';
  await userLogoutService(refreshToken);
  deleteCookie(c, cookieStrings.userLoginAccessToken);
  deleteCookie(c, cookieStrings.userLoginRefreshToken);
  return c.json(new ApiResponse(200, null, 'Logged out successfully.'));
};

export const updateUserLocation = async (c: Context) => {
  const { locationId } = await c.req.json();
  const userId = getUserIdFromAccessToken(getCookie(c, cookieStrings.userLoginAccessToken)!);

  await runInTransaction(async (session) => {
    await updateUserLocationService(userId, locationId, session);
  });

  return c.json(new ApiResponse(200, null, 'Location updated successfully.'));
};

export const updateUserBgColor = async (c: Context) => {
  const { bgColor } = await c.req.json();
  const userId = getUserIdFromAccessToken(getCookie(c, cookieStrings.userLoginAccessToken)!);

  await runInTransaction(async (session) => {
    await updateUserBgColorService(userId, bgColor, session);
  });

  return c.json(new ApiResponse(200, null, 'Background color updated successfully.'));
};
