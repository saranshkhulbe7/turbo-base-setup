import { type Context } from 'hono';
import { runInTransaction } from '@/utils/transaction-helper';
import { ApiResponse } from '@/utils/ApiResponse';
import { getCookie } from 'hono/cookie';
import {
  createUserProposedPollService,
  getAllUserProposedPollsService,
  getUserIdFromAccessToken,
  getUserProposedPollByIdService,
} from '@/module-helpers';
import { cookieStrings } from '@/constants';

export const createProposedPoll = async (c: Context) => {
  const accessToken = getCookie(c, cookieStrings.userLoginAccessToken);
  if (!accessToken) throw new Error('Access token missing.');
  const userId = getUserIdFromAccessToken(accessToken);
  const pollData = await c.req.json();
  const newPoll = await runInTransaction(async (session) => {
    return createUserProposedPollService(userId, pollData, session);
  });
  return c.json(new ApiResponse(201, newPoll, 'Poll created successfully.'));
};

export const getAllUserProposedPolls = async (c: Context) => {
  const accessToken = getCookie(c, cookieStrings.userLoginAccessToken);
  if (!accessToken) throw new Error('Access token missing.');
  const userId = getUserIdFromAccessToken(accessToken);
  const polls = await getAllUserProposedPollsService(userId);
  return c.json(new ApiResponse(200, polls, 'User polls fetched successfully.'));
};

export const getUserProposedPollById = async (c: Context) => {
  const accessToken = getCookie(c, cookieStrings.userLoginAccessToken);
  if (!accessToken) throw new Error('Access token missing.');
  const userId = getUserIdFromAccessToken(accessToken);
  const { _id } = c.req.param();
  const poll = await getUserProposedPollByIdService(userId, _id);
  if (!poll) return c.json(new ApiResponse(404, null, `Poll with ID ${_id} not found.`), 404);
  return c.json(new ApiResponse(200, poll, 'Poll fetched successfully.'));
};
