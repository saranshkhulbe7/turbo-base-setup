import { type Context } from 'hono';
import { runInTransaction } from '@/utils/transaction-helper';
import { ApiResponse } from '@/utils/ApiResponse';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import {
  initiateAdminLoginService,
  verifyAdminLoginService,
  adminRefreshTokenService,
  adminLogoutService,
  getAllUsersService,
  getAdminIdFromAccessToken,
  getAdminDetailsService,
} from '@/module-helpers';
import { cookieStrings } from '@/constants';
import jwt from 'jsonwebtoken';

export const adminLoginInitiate = async (c: Context) => {
  const { email } = await c.req.json();
  await runInTransaction(async (session) => {
    await initiateAdminLoginService(email, session);
  });
  setCookie(c, cookieStrings.adminLoginEmail, email, { httpOnly: false, maxAge: 120 });
  return c.json(new ApiResponse(200, null, 'OTP sent successfully.'));
};

export const adminLoginVerify = async (c: Context) => {
  const email = getCookie(c, cookieStrings.adminLoginEmail);
  if (!email) throw new Error('Email not found in cookies.');
  const { otp } = await c.req.json();
  const { accessToken, refreshToken } = await runInTransaction(async (session) => {
    return verifyAdminLoginService(email, otp, session);
  });
  setCookie(c, cookieStrings.adminLoginAccessToken, accessToken, { httpOnly: false, maxAge: 900 });
  setCookie(c, cookieStrings.adminLoginRefreshToken, refreshToken, { httpOnly: false, maxAge: 86400 });
  return c.json(new ApiResponse(200, null, 'Admin login successful.'));
};

export const adminRefreshToken = async (c: Context) => {
  const refreshToken = getCookie(c, cookieStrings.adminLoginRefreshToken) ?? '';
  const result = await adminRefreshTokenService(refreshToken).catch(() => {
    // If the refresh token is invalid or expired, delete cookies
    deleteCookie(c, cookieStrings.adminLoginAccessToken);
    deleteCookie(c, cookieStrings.adminLoginRefreshToken);
    return null;
  });
  if (!result) {
    return c.json(new ApiResponse(401, null, 'Invalid or expired refresh token.'), 401);
  }
  const { accessToken, newRefreshToken } = result;
  // Set the new tokens in cookies
  setCookie(c, cookieStrings.adminLoginAccessToken, accessToken, { httpOnly: false, maxAge: 900 });
  setCookie(c, cookieStrings.adminLoginRefreshToken, newRefreshToken, { httpOnly: false, maxAge: 86400 });
  return c.json(new ApiResponse(200, null, 'Tokens refreshed successfully.'));
};

export const adminLogout = async (c: Context) => {
  const refreshToken = getCookie(c, cookieStrings.adminLoginRefreshToken) ?? '';
  await adminLogoutService(refreshToken);
  deleteCookie(c, cookieStrings.adminLoginAccessToken);
  deleteCookie(c, cookieStrings.adminLoginRefreshToken);
  return c.json(new ApiResponse(200, null, 'Logged out successfully.'));
};

export const validateAdminToken = async (c: Context) => {
  const accessToken = getCookie(c, cookieStrings.adminLoginAccessToken);
  if (!accessToken) {
    return c.json(new ApiResponse(401, null, 'Unauthorized: No token provided'), 401);
  }
  const decoded = jwt.verify(accessToken, process.env.ADMIN_JWT_SECRET!);
  // If decoded is not valid, jwt.verify will throw, so no need for an explicit check here
  return c.json(new ApiResponse(200, { valid: true, adminId: decoded.adminId }, 'Token is valid.'));
};

export const getAllUsers = async (c: Context) => {
  const users = await getAllUsersService();
  return c.json(new ApiResponse(200, users, 'Users fetched successfully.'));
};

export const getAdminDetails = async (c: Context) => {
  const accessToken = getCookie(c, cookieStrings.adminLoginAccessToken);
  if (!accessToken) throw new Error('Access token is missing.');

  const adminId = getAdminIdFromAccessToken(accessToken);
  const adminDetails = await getAdminDetailsService(adminId);

  if (!adminDetails) {
    return c.json(new ApiResponse(404, null, 'Admin details not found.'), 404);
  }

  return c.json(new ApiResponse(200, adminDetails, 'Admin details fetched successfully.'));
};
