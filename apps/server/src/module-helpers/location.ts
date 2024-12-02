import { LocationModel, type LocationCreateType, type LocationUpdateType } from '@/db/models';
import type { ClientSession } from 'mongoose';

export const getAllLocationsService = async () => {
  return LocationModel.find({ archivedAt: null }).sort({ name: 1 });
};

export const getLocationByIdService = async (_id: string) => {
  return LocationModel.findOne({ _id, archivedAt: null });
};

export const createLocationService = async (locationData: LocationCreateType, session: ClientSession) => {
  const location = new LocationModel(locationData);
  await location.save({ session });
  return location;
};

export const updateLocationService = async (_id: string, updateData: LocationUpdateType, session: ClientSession) => {
  const updatedLocation = await LocationModel.findOneAndUpdate({ _id, archivedAt: null }, { $set: updateData }, { new: true, session });
  if (!updatedLocation) throw new Error(`Location with ID ${_id} not found or is archived.`);
  return updatedLocation;
};

export const deleteLocationService = async (_id: string, session: ClientSession) => {
  return LocationModel.softDelete(_id, { session });
};
