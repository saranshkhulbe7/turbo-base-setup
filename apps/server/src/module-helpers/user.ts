import { LocationModel, UserModel, type IUser } from '@/db/models';
import { sendEmailLoginOTP, sendEmailSignupOTP } from '@/scripts/mail.service';
import type { ClientSession } from 'mongoose';
import jwt from 'jsonwebtoken';
import { redis } from '@/utils/redis';

const generateUserAccessToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.USER_JWT_SECRET!, { expiresIn: process.env.USER_ACCESS_TOKEN_EXPIRY });
};
export const getUserIdFromAccessToken = (accessToken: string): string => {
  const decoded = jwt.verify(accessToken, process.env.USER_JWT_SECRET!) as { userId: string };
  return decoded.userId;
};

const generateUserRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.USER_JWT_SECRET!, { expiresIn: process.env.USER_REFRESH_TOKEN_EXPIRY });
};

export const getUserDetailsService = async (userId: string) => {
  return UserModel.findOne({ _id: userId, archivedAt: null })
    .select('name avatar bgColor coins energy level location')
    .populate('location', 'name imageUrl') // Include location details
    .lean();
};

export const initiateSignupService = async (name: string, email: string, session: ClientSession) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  const otpExpiresAt = 120; // 120 seconds (2 minutes TTL)

  // Check if a verified user already exists
  const existingUser = await UserModel.findOne({ $or: [{ email }, { name }] }).session(session);
  if (existingUser) {
    if (existingUser.email === email) throw new Error('Email is already in use.');
    if (existingUser.name === name) throw new Error('Username is already in use.');
  }

  // Store OTP and user details in Redis
  const redisKey = `signup:${email}:${name}`;
  await redis.set(redisKey, JSON.stringify({ name, email, otp }), 'EX', otpExpiresAt);

  // Send OTP to email
  await sendEmailSignupOTP(email, otp);
};

export const verifySignupService = async (name: string, email: string, otp: string, session: ClientSession): Promise<IUser> => {
  const redisKey = `signup:${email}:${name}`;
  const cachedData = await redis.get(redisKey);

  if (!cachedData) {
    throw new Error('Invalid or expired OTP.');
  }

  const { name: cachedName, email: cachedEmail, otp: cachedOtp } = JSON.parse(cachedData);

  if (cachedOtp !== otp) {
    throw new Error('Invalid OTP.');
  }

  // Check for conflicts with verified users
  const existingUser = await UserModel.findOne({ $or: [{ email: cachedEmail }, { name: cachedName }] }).session(session);
  if (existingUser) {
    if (existingUser.email === cachedEmail) throw new Error('Email is already in use.');
    if (existingUser.name === cachedName) throw new Error('Username is already in use.');
  }

  // Create a new verified user
  const newUser = new UserModel({
    name: cachedName,
    email: cachedEmail,
    coins: 50,
    energy: 50,
    level: 1,
  });

  await newUser.save({ session });

  // Remove OTP data from Redis
  await redis.del(redisKey);

  return newUser;
};

export const initiateLoginService = async (email: string, session: ClientSession) => {
  // Check if the user exists
  const user = await UserModel.findOne({ email }).session(session);
  if (!user) throw new Error('User not found.');

  // Generate OTP and set TTL
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  const otpExpiresAt = 120; // TTL: 120 seconds (2 minutes)

  // Store OTP in Redis with the user-specific key
  const redisKey = `user:login:${email}`;
  await redis.set(redisKey, JSON.stringify({ email, otp }), 'EX', otpExpiresAt);

  // Send OTP to user's email
  await sendEmailLoginOTP(email, otp);
};

export const verifyLoginService = async (email: string, otp: string, session: ClientSession) => {
  // Retrieve cached data from Redis
  const redisKey = `user:login:${email}`;
  const cachedData = await redis.get(redisKey);

  if (!cachedData) throw new Error('Invalid or expired OTP.');

  const { otp: cachedOtp, email: cachedEmail } = JSON.parse(cachedData);

  if (cachedOtp !== otp || cachedEmail !== email) {
    throw new Error('Invalid OTP.');
  }

  // Find the user
  const user = await UserModel.findOne({ email }).session(session);
  if (!user) throw new Error('User not found.');

  // Generate tokens
  const accessToken = generateUserAccessToken(user._id);
  const refreshToken = generateUserRefreshToken(user._id);

  // Save refresh token to the user model
  user.refreshToken = refreshToken;
  await user.save({ session });

  // Remove OTP data from Redis
  await redis.del(redisKey);

  return { accessToken, refreshToken };
};

export const userRefreshTokenService = async (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, process.env.USER_JWT_SECRET!) as { userId: string };
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.refreshToken !== refreshToken) throw new Error('Invalid or expired refresh token.');

  const accessToken = generateUserAccessToken(user._id);
  const newRefreshToken = generateUserRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken, newRefreshToken };
};

export const userLogoutService = async (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, process.env.USER_JWT_SECRET!) as { userId: string };
  const user = await UserModel.findById(decoded.userId);
  if (!user) throw new Error('User not found.');

  user.refreshToken = null;
  await user.save();
};

export const fetchUser = async (user_id: string, session: ClientSession) => {
  const user = await UserModel.findOne({ _id: user_id, archivedAt: null }).session(session);
  if (!user) throw new Error('User not found or is archived.');
  return user;
};

export const updateUserLocationService = async (userId: string, locationId: string, session: ClientSession) => {
  const locationExists = await LocationModel.exists({ _id: locationId, archivedAt: null }).session(session);
  if (!locationExists) throw new Error('Invalid location ID.');

  const user = await UserModel.findById(userId).session(session);
  if (!user) throw new Error('User not found.');
  user.location = locationId;
  await user.save({ session });
};

export const updateUserBgColorService = async (userId: string, bgColor: string, session: ClientSession) => {
  const user = await UserModel.findById(userId).session(session);
  if (!user) throw new Error('User not found.');
  user.bgColor = bgColor;
  await user.save({ session });
};
