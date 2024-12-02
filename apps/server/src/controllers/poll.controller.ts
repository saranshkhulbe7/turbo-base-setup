import { cookieStrings } from '@/constants';
import { PollModel } from '@/db/models';
import { getAdminIdFromAccessToken, getUserIdFromAccessToken } from '@/module-helpers';
import { createPollService, deletePollService, fetchOrRecalculateNextPoll, getAllPollsService, preparePoll } from '@/module-helpers/poll';
import { ApiResponse } from '@/utils/ApiResponse';
import { redis } from '@/utils/redis';
import { runInTransaction } from '@/utils/transaction-helper';
import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

export const getAllPolls = async (c: Context) => {
  const polls = await getAllPollsService();
  return c.json(new ApiResponse(200, polls, 'Polls fetched successfully.'));
};
export const getPollById = async (c: Context) => {
  const { _id } = c.req.param();
  const poll = await getPollByIdService(_id);
  if (!poll) return c.json(new ApiResponse(404, null, `Poll with ID ${_id} not found.`), 404);
  return c.json(new ApiResponse(200, poll, 'Poll fetched successfully.'));
};
export const getPollByIdService = async (_id: string) => {
  return PollModel.findOne({ _id, archivedAt: null });
};
export const createPoll = async (c: Context) => {
  // Get admin ID from the access token
  const accessToken = getCookie(c, cookieStrings.adminLoginAccessToken);
  if (!accessToken) throw new Error('Access token is missing.');
  const adminId = getAdminIdFromAccessToken(accessToken);
  // Run the poll creation inside a transaction
  const pollData = await c.req.json();
  const poll = await runInTransaction(async (session) => createPollService(pollData, adminId, session));
  return c.json(new ApiResponse(201, poll, 'Poll created successfully.'));
};

export const handleMyNextPoll = async (c: Context) => {
  const accessToken = getCookie(c, cookieStrings.userLoginAccessToken);
  if (!accessToken) throw new Error('Access token is required.');
  const userId = getUserIdFromAccessToken(accessToken);
  const nextPoll = await fetchOrRecalculateNextPoll(userId);
  if (!nextPoll) {
    const userPollsKey = `user:${userId}:polls`;
    await redis.del(userPollsKey); // Clear Redis for this user
    return c.json(new ApiResponse(204, null, 'You are all caught up! No polls available.'));
  }
  const poll = await preparePoll(nextPoll.pollId);
  return c.json(new ApiResponse(200, poll, 'Next poll fetched successfully.'));
};

export const deletePolls = async (c: Context) => {
  const { pollIds } = await c.req.json();
  await runInTransaction(async (session) => {
    for (const pollId of pollIds) {
      await deletePollService(pollId, session);
    }
  });
  return c.json(new ApiResponse(200, null, 'Polls deleted successfully.'));
};
