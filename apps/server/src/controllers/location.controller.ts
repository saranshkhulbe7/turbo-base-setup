import {
  createLocationService,
  deleteLocationService,
  getAllLocationsService,
  getLocationByIdService,
  updateLocationService,
} from '@/module-helpers';
import { ApiResponse } from '@/utils/ApiResponse';
import { runInTransaction } from '@/utils/transaction-helper';

import type { Context } from 'hono';

export const getAllLocations = async (c: Context) => {
  const locations = await getAllLocationsService();
  return c.json(new ApiResponse(200, locations, 'Locations fetched successfully.'));
};

export const getLocationById = async (c: Context) => {
  const { _id } = c.req.param();
  const location = await getLocationByIdService(_id);
  if (!location) return c.json(new ApiResponse(404, null, `Location with ID ${_id} not found.`), 404);
  return c.json(new ApiResponse(200, location, 'Location fetched successfully.'));
};

export const createLocation = async (c: Context) => {
  const locationData = await c.req.json();
  const newLocation = await runInTransaction(async (session) => createLocationService(locationData, session));
  return c.json(new ApiResponse(201, newLocation, 'Location created successfully.'));
};

export const updateLocation = async (c: Context) => {
  const { _id } = c.req.param();
  const updateData = await c.req.json();
  const updatedLocation = await runInTransaction(async (session) => updateLocationService(_id, updateData, session));
  return c.json(new ApiResponse(200, updatedLocation, 'Location updated successfully.'));
};

export const deleteLocations = async (c: Context) => {
  const { locationIds } = await c.req.json(); // Fetch locationIds from request body
  console.log('locationIds', locationIds);

  await runInTransaction(async (session) => {
    for (const locationId of locationIds) {
      await deleteLocationService(locationId, session);
    }
  });

  return c.json(new ApiResponse(200, null, 'Locations deleted successfully.'));
};
