import {
  activateEnergyPackage,
  createEnergyPackage,
  deactivateEnergyPackage,
  deleteEnergyPackage,
  getAllEnergyPackages,
  getEnergyPackageById,
  updateEnergyPackage,
} from '@/controllers/energy-package.controller';
import { zodIdSchema } from '@/db/common-schemas';
import { energyPackageCreateSchema, energyPackageUpdateSchema } from '@/db/models';
import { adminAuthMiddleware } from '@/middlewares';
import { zJsonValidator, zParamsValidator } from '@/utils/zValidators';
import { Hono } from 'hono';

export const energyPackageRouter = new Hono();

energyPackageRouter.get('/', adminAuthMiddleware, getAllEnergyPackages);
energyPackageRouter.get('/:_id', adminAuthMiddleware, zParamsValidator(zodIdSchema), getEnergyPackageById);
energyPackageRouter.post('/', adminAuthMiddleware, zJsonValidator(energyPackageCreateSchema), createEnergyPackage);
energyPackageRouter.patch(
  '/:_id',
  adminAuthMiddleware,
  zParamsValidator(zodIdSchema),
  zJsonValidator(energyPackageUpdateSchema),
  updateEnergyPackage
);
energyPackageRouter.patch('/activate/:_id', adminAuthMiddleware, zParamsValidator(zodIdSchema), activateEnergyPackage);
energyPackageRouter.patch('/deactivate/:_id', adminAuthMiddleware, zParamsValidator(zodIdSchema), deactivateEnergyPackage);
energyPackageRouter.delete('/:_id', adminAuthMiddleware, zParamsValidator(zodIdSchema), deleteEnergyPackage);
