import { Schema } from 'mongoose';
import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { mongoIdZod } from '../common-schemas';

// Zod schema for Comment
const zObject = z.object({
  poll_id: mongoIdZod.min(1, { message: 'Poll ID is required' }),
  user_id: mongoIdZod.min(1, { message: 'User ID is required' }), // Added user_id explicitly
  comment: z.string().min(1, { message: 'Comment cannot be empty' }).optional(),
  gifUrl: z.string().url({ message: 'Invalid URL format' }).optional(),
});

export const commentZodSchema = zObject.strict().refine((data) => (data.comment && !data.gifUrl) || (!data.comment && data.gifUrl), {
  message: 'You must provide either "comment" or "gifUrl", but not both.',
});

export const commentCreateSchema = zObject
  .pick({
    poll_id: true,
    comment: true,
    gifUrl: true,
  })
  .strict()
  .refine((data) => (data.comment && !data.gifUrl) || (!data.comment && data.gifUrl), {
    message: 'You must provide either "comment" or "gifUrl", but not both.',
  });

// Define TypeScript types
export type CommentCreateType = z.infer<typeof commentCreateSchema>;
export type IComment = z.infer<typeof commentZodSchema> & IBaseDocument;

// Create Mongoose schema
const commentSchema = createSchema<IComment>({
  poll_id: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Added user_id in Mongoose schema
  comment: { type: String, default: null },
  gifUrl: { type: String, default: null },
});

export const CommentModel = createModel<IComment>('Comment', commentSchema);
