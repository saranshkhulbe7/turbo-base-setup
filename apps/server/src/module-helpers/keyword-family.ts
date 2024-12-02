import { KeywordFamilyModel, KeywordModel, type KeywordFamilyCreateType, type KeywordFamilyUpdateType } from '@/db/models';
import type { ClientSession } from 'mongoose';

// Get all keyword families
export const getAllKeywordFamiliesService = async () => {
  return KeywordFamilyModel.find({ archivedAt: null }); // Exclude archived keyword families
};

// Get keyword family by ID
export const getKeywordFamilyByIdService = async (_id: string) => {
  return KeywordFamilyModel.findOne({ _id, archivedAt: null }); // Fetch keyword family if not archived
};

export const getKeywordsByFamilyIdService = async (keywordFamilyId: string) => {
  // Check if the keyword family exists
  const familyExists = await KeywordFamilyModel.exists({ _id: keywordFamilyId, archivedAt: null });
  if (!familyExists) {
    throw new Error('Keyword family does not exist or is archived.');
  }

  // Fetch keywords for the family
  const keywords = await KeywordModel.find({ keywordFamily_id: keywordFamilyId, archivedAt: null });
  return keywords;
};

// Create a keyword family
export const createKeywordFamilyService = async (keywordFamilyData: KeywordFamilyCreateType, session: ClientSession) => {
  const keywordFamily = new KeywordFamilyModel(keywordFamilyData);
  await keywordFamily.save({ session });
  return keywordFamily;
};

// Update a keyword family
export const updateKeywordFamilyService = async (_id: string, updateData: KeywordFamilyUpdateType, session: ClientSession) => {
  const keywordFamily = await KeywordFamilyModel.findOneAndUpdate({ _id }, { $set: updateData }, { new: true, session });
  if (!keywordFamily) throw new Error(`Keyword Family with ID ${_id} not found.`);
  return keywordFamily;
};

// Delete a keyword family
export const deleteKeywordFamilyService = async (familyId: string, session: ClientSession) => {
  return KeywordFamilyModel.softDelete(familyId, { session });
};
