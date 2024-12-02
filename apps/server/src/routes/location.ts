import { createLocation, deleteLocations, getAllLocations, getLocationById, updateLocation } from '@/controllers/location.controller';
import { zodIdSchema } from '@/db/common-schemas';
import { locationCreateSchema, locationDeleteSchema, locationUpdateSchema } from '@/db/models';
import { adminAuthMiddleware, unifiedMiddleware } from '@/middlewares';
import { zJsonValidator, zParamsValidator } from '@/utils/zValidators';
import { Hono } from 'hono';

export const locationRouter = new Hono();

locationRouter.get('/', unifiedMiddleware, getAllLocations);
locationRouter.get('/:_id', adminAuthMiddleware, zParamsValidator(zodIdSchema), getLocationById);
locationRouter.post('/', adminAuthMiddleware, zJsonValidator(locationCreateSchema), createLocation);
locationRouter.patch('/:_id', adminAuthMiddleware, zJsonValidator(locationUpdateSchema), zParamsValidator(zodIdSchema), updateLocation);
locationRouter.delete('/', adminAuthMiddleware, zJsonValidator(locationDeleteSchema), deleteLocations);
