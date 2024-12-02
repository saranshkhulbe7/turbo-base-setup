import {
  createKeywordFamilyRelationsService,
  deleteKeywordFamilyRelationsService,
  getAllKeywordFamilyRelationsService,
  getRelationsByFromKeywordFamilyService,
} from '@/module-helpers';
import { ApiResponse } from '@/utils/ApiResponse';
import { runInTransaction } from '@/utils/transaction-helper';
import type { Context } from 'hono';

// Get all relations
export const getAllKeywordFamilyRelations = async (c: Context) => {
  const relations = await getAllKeywordFamilyRelationsService();
  return c.json(new ApiResponse(200, relations, 'Keyword family relations fetched successfully.'));
};
export const getRelationsByFromKeywordFamily = async (c: Context) => {
  const { keywordFamilyId } = c.req.param(); // Extract the `keywordFamilyId` from params
  const relations = await getRelationsByFromKeywordFamilyService(keywordFamilyId);
  return c.json(new ApiResponse(200, relations, 'Relations fetched successfully.'));
};
// Create multiple relations
export const createKeywordFamilyRelations = async (c: Context) => {
  const { from_keyword_family_id, to_keyword_family_ids } = await c.req.json();
  const createdRelations = await runInTransaction(async (session) => {
    return createKeywordFamilyRelationsService(from_keyword_family_id, to_keyword_family_ids, session);
  });
  return c.json(new ApiResponse(201, createdRelations, 'Keyword family relations created successfully.'));
};

// Delete multiple relations
export const deleteKeywordFamilyRelations = async (c: Context) => {
  const { from_keyword_family_id } = c.req.param();
  const { to_keyword_family_ids } = await c.req.json();
  await runInTransaction(async (session) => {
    await deleteKeywordFamilyRelationsService(from_keyword_family_id, to_keyword_family_ids, session);
  });

  return c.json(new ApiResponse(200, null, 'Keyword family relations deleted successfully.'));
};
