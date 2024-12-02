import { ApiResponse } from '@/utils/ApiResponse';
import { runInTransaction } from '@/utils/transaction-helper';
import { getCookie } from 'hono/cookie';
import type { Context } from 'hono';
import { getUserIdFromAccessToken, toggleDislikeService, toggleLikeService } from '@/module-helpers';
import { cookieStrings } from '@/constants';

export const toggleLike = async (c: Context) => {
  const { comment_id } = await c.req.json();
  const accessToken = getCookie(c, cookieStrings.userLoginAccessToken);
  if (!accessToken) throw new Error('Access token is required.');
  const user_id = getUserIdFromAccessToken(accessToken);
  await runInTransaction(async (session) => {
    await toggleLikeService(comment_id, user_id, session);
  });
  return c.json(new ApiResponse(200, null, 'Toggled like successfully.'));
};

export const toggleDislike = async (c: Context) => {
  const { comment_id } = await c.req.json();
  const accessToken = getCookie(c, cookieStrings.userLoginAccessToken);
  if (!accessToken) throw new Error('Access token is required.');
  const user_id = getUserIdFromAccessToken(accessToken);
  await runInTransaction(async (session) => {
    await toggleDislikeService(comment_id, user_id, session);
  });
  return c.json(new ApiResponse(200, null, 'Toggled dislike successfully.'));
};
