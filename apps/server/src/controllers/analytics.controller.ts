import type { Context } from 'hono';
import { ApiResponse } from '@/utils/ApiResponse';
import { getOpinionDistributionService } from '@/module-helpers';

export const getOpinionDistribution = async (c: Context) => {
  const { opinionId, keywordFamilyIds, filters } = await c.req.json(); // Extract filters key from body
  const distribution = await getOpinionDistributionService(opinionId, keywordFamilyIds, filters);
  return c.json(new ApiResponse(200, distribution, 'Distribution fetched successfully.'));
};
