import { KeywordModel, type KeywordCreateType, type KeywordUpdateType } from '@/db/models';
import type { ClientSession } from 'mongoose';

// Get all keywords
export const getAllKeywordsService = async () => {
  return KeywordModel.find({ archivedAt: null }).populate('keywordFamily_id'); // Exclude archived keywords and populate keywordFamily
};

// Get keyword by ID
export const getKeywordByIdService = async (_id: string) => {
  return KeywordModel.findOne({ _id, archivedAt: null }).populate('keywordFamily_id'); // Fetch keyword if not archived
};

// Create a keyword
export const createKeywordService = async (keywordData: KeywordCreateType, session: ClientSession) => {
  const keyword = new KeywordModel(keywordData);
  await keyword.save({ session });
  return keyword;
};

// Update a keyword
export const updateKeywordService = async (_id: string, updateData: KeywordUpdateType, session: ClientSession) => {
  const keyword = await KeywordModel.findOneAndUpdate({ _id }, { $set: updateData }, { new: true, session });
  if (!keyword) throw new Error(`Keyword with ID ${_id} not found.`);
  return keyword;
};

// Delete a keyword
export const deleteKeywordService = async (keywordId: string, session: ClientSession) => {
  return KeywordModel.softDelete(keywordId, { session });
};
