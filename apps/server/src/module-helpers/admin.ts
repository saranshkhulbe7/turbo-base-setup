import { AdminModel, UserModel } from '@/db/models';
import jwt from 'jsonwebtoken';
import { sendEmailOTP } from '@/scripts/mail.service';
import type { ClientSession } from 'mongoose';
import { AdminLoginModel } from '@/db/models/admin-login';
import mongoose from 'mongoose';
import { redis } from '@/utils/redis';

const generateAdminAccessToken = (adminId: string) => {
  return jwt.sign({ adminId }, process.env.ADMIN_JWT_SECRET!, { expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRY });
};
export const getAdminIdFromAccessToken = (accessToken: string): string => {
  const decoded = jwt.verify(accessToken, process.env.ADMIN_JWT_SECRET!) as { adminId: string };
  return decoded.adminId;
};
const generateAdminRefreshToken = (adminId: string) => {
  return jwt.sign({ adminId }, process.env.ADMIN_JWT_SECRET!, { expiresIn: process.env.ADMIN_REFRESH_TOKEN_EXPIRY });
};

export const initiateAdminLoginService = async (email: string, session: ClientSession) => {
  // Check if the admin exists
  const admin = await AdminModel.findOne({ email }).session(session);
  if (!admin) throw new Error('Admin not found.');

  // Generate OTP and set TTL
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  const otpExpiresAt = 120; // TTL: 120 seconds (2 minutes)

  // Store OTP in Redis with admin-specific key
  const redisKey = `admin:login:${email}`;
  await redis.set(redisKey, JSON.stringify({ email, otp }), 'EX', otpExpiresAt);

  // Send OTP to admin's email
  await sendEmailOTP(email, otp);
};

export const verifyAdminLoginService = async (email: string, otp: string, session: ClientSession) => {
  // Retrieve cached data from Redis
  const redisKey = `admin:login:${email}`;
  const cachedData = await redis.get(redisKey);

  if (!cachedData) throw new Error('Invalid or expired OTP.');

  const { otp: cachedOtp, email: cachedEmail } = JSON.parse(cachedData);

  if (cachedOtp !== otp || cachedEmail !== email) {
    throw new Error('Invalid OTP.');
  }

  // Find the admin
  const admin = await AdminModel.findOne({ email }).session(session);
  if (!admin) throw new Error('Admin not found.');

  // Generate tokens
  const accessToken = generateAdminAccessToken(admin._id);
  const refreshToken = generateAdminRefreshToken(admin._id);

  // Save refresh token to the admin model
  admin.refreshToken = refreshToken;
  await admin.save({ session });

  // Remove OTP data from Redis
  await redis.del(redisKey);

  return { accessToken, refreshToken };
};

export const adminRefreshTokenService = async (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, process.env.ADMIN_JWT_SECRET!) as { adminId: string };

  const admin = await AdminModel.findById(decoded.adminId);
  if (!admin || admin.refreshToken !== refreshToken) {
    // Return `null` to indicate invalid or expired token
    return null;
  }

  const accessToken = generateAdminAccessToken(admin._id);
  const newRefreshToken = generateAdminRefreshToken(admin._id);

  admin.refreshToken = newRefreshToken;
  await admin.save();

  return { accessToken, newRefreshToken };
};

export const adminLogoutService = async (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, process.env.ADMIN_JWT_SECRET!) as { adminId: string };
  const admin = await AdminModel.findById(decoded.adminId);
  if (!admin) throw new Error('Admin not found.');
  admin.refreshToken = null;
  await admin.save();
};

export const createAdmin = async (name: string, email: string): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const exists = await AdminModel.exists({ email }).session(session);
    if (exists) throw new Error('Admin with the provided email already exists.');
    const admin = await AdminModel.create([{ name, email }], { session });
    await session.commitTransaction();
    console.log('Admin created successfully:', admin[0]);
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating admin:', error?.message || error);
  } finally {
    session.endSession();
  }
};

export const getAllUsersService = async () => {
  return UserModel.find({ archivedAt: null }) // Exclude archived users
    .select('name avatar bgColor level') // Select only relevant fields
    .lean(); // Optimize for read-only operation
};

export const getAdminDetailsService = async (adminId: string) => {
  return AdminModel.findOne({ _id: adminId, archivedAt: null })
    .select('name email') // Fetch only name and email
    .lean();
};
