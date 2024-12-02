import { getOverviewService } from '@/module-helpers';
import { ApiResponse } from '@/utils/ApiResponse';
import type { Context } from 'hono';

export const getOverview = async (c: Context) => {
  const overviewData = await getOverviewService();
  return c.json(new ApiResponse(200, overviewData, 'Overview data fetched successfully.'));
};
