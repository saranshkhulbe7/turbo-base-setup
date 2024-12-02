import {
  activateEnergyPackageService,
  createEnergyPackageService,
  deactivateEnergyPackageService,
  deleteEnergyPackageService,
  getAllEnergyPackagesService,
  getEnergyPackageByIdService,
  updateEnergyPackageService,
} from '@/module-helpers';
import { ApiResponse } from '@/utils/ApiResponse';
import { runInTransaction } from '@/utils/transaction-helper';

import type { Context } from 'hono';

export const getAllEnergyPackages = async (c: Context) => {
  const packages = await getAllEnergyPackagesService();
  return c.json(new ApiResponse(200, packages, 'Energy packages fetched successfully.'));
};

export const getEnergyPackageById = async (c: Context) => {
  const { _id } = c.req.param();
  const energyPackage = await getEnergyPackageByIdService(_id);
  if (!energyPackage) return c.json(new ApiResponse(404, null, `Energy package with ID ${_id} not found.`), 404);
  return c.json(new ApiResponse(200, energyPackage, 'Energy package fetched successfully.'));
};

export const createEnergyPackage = async (c: Context) => {
  const energyPackageData = await c.req.json();
  const newPackage = await runInTransaction(async (session) => createEnergyPackageService(energyPackageData, session));
  return c.json(new ApiResponse(201, newPackage, 'Energy package created successfully.'));
};

export const updateEnergyPackage = async (c: Context) => {
  const { _id } = c.req.param();
  const updateData = await c.req.json();
  const updatedPackage = await runInTransaction(async (session) => updateEnergyPackageService(_id, updateData, session));
  return c.json(new ApiResponse(200, updatedPackage, 'Energy package updated successfully.'));
};

export const activateEnergyPackage = async (c: Context) => {
  const { _id } = c.req.param();
  const updatedPackage = await runInTransaction(async (session) => activateEnergyPackageService(_id, session));
  return c.json(new ApiResponse(200, updatedPackage, 'Energy package activated successfully.'));
};

export const deactivateEnergyPackage = async (c: Context) => {
  const { _id } = c.req.param();
  const updatedPackage = await runInTransaction(async (session) => deactivateEnergyPackageService(_id, session));
  return c.json(new ApiResponse(200, updatedPackage, 'Energy package deactivated successfully.'));
};

export const deleteEnergyPackage = async (c: Context) => {
  const { _id } = c.req.param();
  await runInTransaction(async (session) => deleteEnergyPackageService(_id, session));
  return c.json(new ApiResponse(200, null, 'Energy package deleted successfully.'));
};
