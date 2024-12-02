import { createKeywordService, deleteKeywordService, getAllKeywordsService, getKeywordByIdService, updateKeywordService } from '@/module-helpers';
import { ApiResponse } from '@/utils/ApiResponse';
import { runInTransaction } from '@/utils/transaction-helper';
import type { Context } from 'hono';

// Get all keywords
export const getAllKeywords = async (c: Context) => {
  const keywords = await getAllKeywordsService();
  return c.json(new ApiResponse(200, keywords, 'Keywords fetched successfully.'));
};

// Get keyword by ID
export const getKeywordById = async (c: Context) => {
  const { _id } = c.req.param();
  const keyword = await getKeywordByIdService(_id);
  if (!keyword) return c.json(new ApiResponse(404, null, `Keyword with ID ${_id} not found.`), 404);
  return c.json(new ApiResponse(200, keyword, 'Keyword fetched successfully.'));
};

// Create a keyword
export const createKeyword = async (c: Context) => {
  const keywordData = await c.req.json();
  const newKeyword = await runInTransaction(async (session) => {
    return createKeywordService(keywordData, session);
  });
  return c.json(new ApiResponse(201, newKeyword, 'Keyword created successfully.'));
};

// Update a keyword
export const updateKeyword = async (c: Context) => {
  const { _id } = c.req.param();
  const updateData = await c.req.json();
  const updatedKeyword = await runInTransaction(async (session) => {
    return updateKeywordService(_id, updateData, session);
  });
  return c.json(new ApiResponse(200, updatedKeyword, 'Keyword updated successfully.'));
};

// Delete a keyword
export const deleteKeywords = async (c: Context) => {
  const { keywordIds } = await c.req.json(); // Expecting an object with "keywordIds" array
  await runInTransaction(async (session) => {
    for (const keywordId of keywordIds) {
      await deleteKeywordService(keywordId, session);
    }
  });

  return c.json(new ApiResponse(200, null, 'Keywords deleted successfully.'));
};
