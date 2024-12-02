import { LocationKeywordFamilyModel, type LocationKeywordFamilyCreateType } from '@/db/models';
import type { ClientSession } from 'mongoose';

// Create a new LocationKeywordFamily entry
export const createLocationKeywordFamilyService = async (data: LocationKeywordFamilyCreateType, session: ClientSession) => {
  const entry = new LocationKeywordFamilyModel(data);
  await entry.save({ session });
  return entry;
};

// Delete a LocationKeywordFamily entry by location_id and keyword_family_id
export const deleteLocationKeywordFamilyService = async (location_id: string, keyword_family_id: string, session: ClientSession) => {
  const existing = await LocationKeywordFamilyModel.findOne({ location_id, keyword_family_id, archivedAt: null });
  if (!existing) throw new Error('LocationKeywordFamily entry not found or already deleted.');

  return LocationKeywordFamilyModel.softDelete(existing._id, { session });
};

export const getKeywordFamiliesByLocationService = async (location_id: string) => {
  return LocationKeywordFamilyModel.find({ location_id, archivedAt: null }).populate('keyword_family_id', 'name');
};
