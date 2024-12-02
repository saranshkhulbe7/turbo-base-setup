import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';

// Zod schema for Energy Package
export const energyPackageZodSchema = z
  .object({
    quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
    amount: z.number().min(1, { message: 'Amount must be non-negative' }),
    isActive: z.boolean().default(true),
    archivedAt: z.date().nullable().default(null),
  })
  .strict();

export const energyPackageCreateSchema = energyPackageZodSchema.pick({
  quantity: true,
  amount: true,
});

export const energyPackageUpdateSchema = energyPackageCreateSchema;

export type EnergyPackageCreateType = z.infer<typeof energyPackageCreateSchema>;
export type EnergyPackageUpdateType = z.infer<typeof energyPackageUpdateSchema>;

// Define the type for Energy Package
export type IEnergyPackage = z.infer<typeof energyPackageZodSchema> & IBaseDocument;

// Create Mongoose schema for Energy Package
const energyPackageSchema = createSchema<IEnergyPackage>({
  quantity: { type: Number, required: true, min: 1 },
  amount: { type: Number, required: true, min: 1 },
  isActive: { type: Boolean, required: true, default: true }, // Default to true
});

export const EnergyPackageModel = createModel<IEnergyPackage>('EnergyPackage', energyPackageSchema);
