import { createLocationKeywordFamilyService, deleteLocationKeywordFamilyService } from '@/module-helpers';
import { ApiResponse } from '@/utils/ApiResponse';
import { runInTransaction } from '@/utils/transaction-helper';
import type { Context } from 'hono';

export const createLocationKeywordFamily = async (c: Context) => {
  const data = await c.req.json();
  const newEntry = await runInTransaction(async (session) => createLocationKeywordFamilyService(data, session));
  return c.json(new ApiResponse(201, newEntry, 'LocationKeywordFamily entry created successfully.'));
};

export const deleteLocationKeywordFamily = async (c: Context) => {
  const { location_id, keyword_family_id } = await c.req.json();
  await runInTransaction(async (session) => deleteLocationKeywordFamilyService(location_id, keyword_family_id, session));
  return c.json(new ApiResponse(200, null, 'LocationKeywordFamily entry deleted successfully.'));
};
