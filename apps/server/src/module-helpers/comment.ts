import { CommentModel, CommentResponseModel, type CommentCreateType } from '@/db/models';
import { getUserIdFromAccessToken } from '@/module-helpers';
import type { ClientSession } from 'mongoose';

export const createCommentService = async (commentData: CommentCreateType, session: ClientSession) => {
  const comment = new CommentModel(commentData);
  await comment.save({ session });
  return comment;
};

export const deleteCommentService = async (_id: string, accessToken: string, session: ClientSession) => {
  const user_id = getUserIdFromAccessToken(accessToken);
  const comment = await CommentModel.findOne({ _id, user_id, archivedAt: null }).session(session);
  if (!comment) throw new Error(`Comment with ID ${_id} not found or already archived.`);
  return CommentModel.softDelete(_id, { session });
};

export const getCommentsByPollService = async (poll_id: string) => {
  // Fetch all comments for the poll
  const comments = await CommentModel.find({ poll_id, archivedAt: null })
    .populate('user_id', 'name level avatar bgColor') // Include user details
    .sort({ createdAt: -1 }) // Sort by latest first
    .lean();

  // Add likes and dislikes count for each comment
  const commentsWithCounts = await Promise.all(
    comments.map(async (comment) => {
      const likesCount = await CommentResponseModel.countDocuments({
        comment_id: comment._id,
        response: 'like',
      });

      const dislikesCount = await CommentResponseModel.countDocuments({
        comment_id: comment._id,
        response: 'dislike',
      });

      return {
        ...comment,
        user: comment.user_id, // Include populated user details
        likes: likesCount,
        dislikes: dislikesCount,
      };
    })
  );

  return commentsWithCounts;
};
