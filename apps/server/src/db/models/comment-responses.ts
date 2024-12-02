import { Schema } from 'mongoose';
import { createSchema, createModel, type IBaseDocument } from '../base';
import { z } from 'zod';
import { mongoIdZod } from '../common-schemas';

// Zod schema for CommentResponse
export const commentResponseZodSchema = z
  .object({
    comment_id: mongoIdZod.min(1, { message: 'Comment ID is required' }),
    user_id: mongoIdZod.min(1, { message: 'User ID is required' }),
    response: z.enum(['like', 'dislike'], { required_error: 'Response is required' }),
  })
  .strict();

export const commentResponseToggleSchema = commentResponseZodSchema.pick({
  comment_id: true,
});

export type CommentResponseToggleType = z.infer<typeof commentResponseToggleSchema>;
export type ICommentResponse = z.infer<typeof commentResponseZodSchema> & IBaseDocument;

// Mongoose Schema
const commentResponseSchema = createSchema<ICommentResponse>({
  comment_id: { type: Schema.Types.ObjectId, ref: 'Comment', required: true, uniqueCombination: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, uniqueCombination: true },
  response: { type: String, enum: ['like', 'dislike'], required: true },
});

// Export Model
export const CommentResponseModel = createModel<ICommentResponse>('CommentResponse', commentResponseSchema);
