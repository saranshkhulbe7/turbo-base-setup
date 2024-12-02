import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';

export const adminZodSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email format' }),
    refreshToken: z.string().nullable().default(null),
    archivedAt: z.date().nullable().default(null),
  })
  .strict();

export const adminCreateSchema = adminZodSchema.pick({
  name: true,
  email: true,
});

export const adminUpdateSchema = adminCreateSchema.partial();

export type AdminCreateType = z.infer<typeof adminCreateSchema>;
export type AdminUpdateType = z.infer<typeof adminUpdateSchema>;
export type IAdmin = z.infer<typeof adminZodSchema> & IBaseDocument;

const adminSchema = createSchema<IAdmin>({
  name: { type: String, required: true },
  email: { type: String, required: true, uniqueCombination: true },
  refreshToken: { type: String, default: null },
});

export const AdminModel = createModel<IAdmin>('Admin', adminSchema);
