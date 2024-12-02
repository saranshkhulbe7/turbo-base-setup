import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';

// Zod Schema for Avatar validation
export const avatarZodSchema = z
  .object({
    name: z.string().min(1, { message: 'Avatar name is required' }),
    image: z.string().url({ message: 'Invalid image URL format' }),
    archivedAt: z.date().nullable().default(null),
  })
  .strict();

export const avatarCreateSchema = avatarZodSchema.pick({
  name: true,
  image: true,
});

export type AvatarCreateType = z.infer<typeof avatarCreateSchema>;

export type IAvatar = z.infer<typeof avatarZodSchema> & IBaseDocument;

// Mongoose Schema for Avatar
const avatarSchema = createSchema<IAvatar>({
  name: { type: String, required: true, uniqueCombination: true },
  image: { type: String, required: true },
});

export const AvatarModel = createModel<IAvatar>('Avatar', avatarSchema);
