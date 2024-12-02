import { createInteractionService } from '@/module-helpers/interaction';
import { ApiResponse } from '@/utils/ApiResponse';
import { runInTransaction } from '@/utils/transaction-helper';
import { getUserIdFromAccessToken } from '@/module-helpers';
import { getCookie } from 'hono/cookie';
import type { Context } from 'hono';
import { cookieStrings } from '@/constants';

export const createInteraction = async (c: Context) => {
  const accessToken = getCookie(c, cookieStrings.userLoginAccessToken);
  if (!accessToken) throw new Error('Access token is missing.');
  const userId = getUserIdFromAccessToken(accessToken);
  const input = await c.req.json();
  const interaction = await runInTransaction((session) => createInteractionService(userId, input, session));
  return c.json(new ApiResponse(201, interaction, 'Interaction created successfully.'));
};
