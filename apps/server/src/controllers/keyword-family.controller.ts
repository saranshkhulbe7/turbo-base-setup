import {
  createKeywordFamilyService,
  deleteKeywordFamilyService,
  getAllKeywordFamiliesService,
  getKeywordFamilyByIdService,
  getKeywordsByFamilyIdService,
  updateKeywordFamilyService,
} from '@/module-helpers';
import { ApiResponse } from '@/utils/ApiResponse';
import { runInTransaction } from '@/utils/transaction-helper';
import type { Context } from 'hono';

export const getAllKeywordFamilies = async (c: Context) => {
  const keywordFamilies = await getAllKeywordFamiliesService();
  return c.json(new ApiResponse(200, keywordFamilies, 'Keyword Families fetched successfully.'));
};

export const getKeywordFamilyById = async (c: Context) => {
  const { _id } = c.req.param();
  const keywordFamily = await getKeywordFamilyByIdService(_id);
  if (!keywordFamily) return c.json(new ApiResponse(404, null, `Keyword Family with ID ${_id} not found.`), 404);
  return c.json(new ApiResponse(200, keywordFamily, 'Keyword Family fetched successfully.'));
};

export const getFamilyKeywords = async (c: Context) => {
  const { _id } = c.req.param(); // Get family ID from params
  const keywords = await getKeywordsByFamilyIdService(_id);
  return c.json(new ApiResponse(200, keywords, 'Keywords fetched successfully.'));
};

export const createKeywordFamily = async (c: Context) => {
  const keywordFamilyData = await c.req.json();
  const newKeywordFamily = await runInTransaction(async (session) => {
    return createKeywordFamilyService(keywordFamilyData, session);
  });
  return c.json(new ApiResponse(201, newKeywordFamily, 'Keyword Family created successfully.'));
};

export const updateKeywordFamily = async (c: Context) => {
  const { _id } = c.req.param();
  const updateData = await c.req.json();
  const updatedKeywordFamily = await runInTransaction(async (session) => {
    return updateKeywordFamilyService(_id, updateData, session);
  });
  return c.json(new ApiResponse(200, updatedKeywordFamily, 'Keyword Family updated successfully.'));
};

export const deleteKeywordFamilies = async (c: Context) => {
  const { keywordFamilyIds } = await c.req.json(); // Expecting an object with "keywordFamilyIds" array
  await runInTransaction(async (session) => {
    for (const familyId of keywordFamilyIds) {
      await deleteKeywordFamilyService(familyId, session);
    }
  });

  return c.json(new ApiResponse(200, null, 'Keyword Families deleted successfully.'));
};
