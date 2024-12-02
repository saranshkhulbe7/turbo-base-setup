import { Schema, Types } from 'mongoose';
import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';

// Zod Schema
export const transactionZodSchema = z
  .object({
    user_id: z.string().min(1, { message: 'User ID is required' }),
    resource: z.union([
      z.object({
        type: z.literal('coin'),
        amount: z.number().positive({ message: 'Amount must be a positive number' }),
        rate: z.number().positive({ message: 'Rate must be a positive number' }),
        quantity: z.number().positive({ message: 'Quantity must be a positive number' }),
      }),
      z.object({
        type: z.literal('energy'),
        package: z.string().min(1, { message: 'Package ID is required' }),
      }),
    ]),
    archivedAt: z.date().nullable().optional(),
  })
  .strict();

// Create and Update schemas for validation
export const transactionCreateSchema = transactionZodSchema.pick({
  user_id: true,
  resource: true,
});

export const transactionUpdateSchema = transactionCreateSchema.partial();

// Define TypeScript interface
export type ITransaction = z.infer<typeof transactionZodSchema> & IBaseDocument;

// Mongoose Schema Definitions
const transactionBaseSchema = createSchema<ITransaction>({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  archivedAt: { type: Date, default: null },
});

const transactionCoinSchema = createSchema({
  type: { type: String, enum: ['coin'], required: true },
  amount: { type: Number, required: true },
  rate: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const transactionEnergySchema = createSchema({
  type: { type: String, enum: ['energy'], required: true },
  package: { type: Types.ObjectId, ref: 'EnergyPackage', required: true },
});

// Base Model with discriminator setup
const TransactionModel = createModel<ITransaction>('Transaction', transactionBaseSchema);

TransactionModel.discriminator('Transaction_Coin', transactionCoinSchema);

TransactionModel.discriminator('Transaction_Energy', transactionEnergySchema);

// Export the Base Transaction Model
export { TransactionModel };
