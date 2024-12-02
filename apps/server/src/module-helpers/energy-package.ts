import { EnergyPackageModel, type EnergyPackageCreateType, type EnergyPackageUpdateType } from '@/db/models';
import type { ClientSession } from 'mongoose';

export const getAllEnergyPackagesService = async () => {
  return EnergyPackageModel.find({ archivedAt: null });
};

export const getEnergyPackageByIdService = async (_id: string) => {
  return EnergyPackageModel.findOne({ _id, archivedAt: null });
};

export const createEnergyPackageService = async (packageData: EnergyPackageCreateType, session: ClientSession) => {
  const energyPackage = new EnergyPackageModel(packageData);
  await energyPackage.save({ session });
  return energyPackage;
};

export const updateEnergyPackageService = async (_id: string, updateData: EnergyPackageUpdateType, session: ClientSession) => {
  const updatedPackage = await EnergyPackageModel.findOneAndUpdate({ _id, archivedAt: null }, { $set: updateData }, { new: true, session });
  if (!updatedPackage) throw new Error(`Energy package with ID ${_id} not found or is archived.`);
  return updatedPackage;
};

export const activateEnergyPackageService = async (_id: string, session: ClientSession) => {
  const updatedPackage = await EnergyPackageModel.findOneAndUpdate({ _id, archivedAt: null }, { $set: { isActive: true } }, { new: true, session });
  if (!updatedPackage) throw new Error(`Energy package with ID ${_id} not found or is archived.`);
  return updatedPackage;
};

export const deactivateEnergyPackageService = async (_id: string, session: ClientSession) => {
  const updatedPackage = await EnergyPackageModel.findOneAndUpdate({ _id, archivedAt: null }, { $set: { isActive: false } }, { new: true, session });
  if (!updatedPackage) throw new Error(`Energy package with ID ${_id} not found or is archived.`);
  return updatedPackage;
};

export const deleteEnergyPackageService = async (_id: string, session: ClientSession) => {
  return EnergyPackageModel.softDelete(_id, { session });
};
