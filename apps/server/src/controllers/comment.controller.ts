import { type Context } from 'hono';
import { runInTransaction } from '@/utils/transaction-helper';
import { ApiResponse } from '@/utils/ApiResponse';
import { getCookie } from 'hono/cookie';
import { createCommentService, deleteCommentService, getCommentsByPollService, getUserIdFromAccessToken } from '@/module-helpers';
import { cookieStrings } from '@/constants';

export const createComment = async (c: Context) => {
  const accessToken = getCookie(c, cookieStrings.userLoginAccessToken);
  if (!accessToken) throw new Error('Access token is missing.');

  const commentData = await c.req.json();

  // Add user_id from the access token
  const userId = getUserIdFromAccessToken(accessToken);
  commentData.user_id = userId; // Explicitly add user_id

  const newComment = await runInTransaction(async (session) => createCommentService(commentData, session));
  return c.json(new ApiResponse(201, newComment, 'Comment created successfully.'));
};

export const deleteComment = async (c: Context) => {
  const accessToken = getCookie(c, cookieStrings.userLoginAccessToken);
  if (!accessToken) throw new Error('Access token is missing.');
  const { _id } = c.req.param();
  await runInTransaction(async (session) => deleteCommentService(_id, accessToken, session));
  return c.json(new ApiResponse(200, null, 'Comment deleted successfully.'));
};

export const getCommentsByPoll = async (c: Context) => {
  const { _id } = c.req.param();
  console.log('id', _id);
  const comments = await getCommentsByPollService(_id);
  console.log('comments', comments);
  return c.json(new ApiResponse(200, comments, 'Comments fetched successfully.'));
};
