import { CommentResponseModel } from '@/db/models';
import type { ClientSession } from 'mongoose';

export const toggleLikeService = async (comment_id: string, user_id: string, session: ClientSession) => {
  const existingResponse = await CommentResponseModel.findOne({ comment_id, user_id }).session(session);

  if (existingResponse) {
    // If the existing response is "like", remove it
    if (existingResponse.response === 'like') {
      await CommentResponseModel.deleteOne({ _id: existingResponse._id }, { session });
      return;
    }

    // If the existing response is "dislike", update it to "like"
    await CommentResponseModel.updateOne({ _id: existingResponse._id }, { response: 'like' }, { session });
    return;
  }

  // Create a new "like" response
  const responseDoc = new CommentResponseModel({ comment_id, user_id, response: 'like' });
  await responseDoc.save({ session });
};

export const toggleDislikeService = async (comment_id: string, user_id: string, session: ClientSession) => {
  const existingResponse = await CommentResponseModel.findOne({ comment_id, user_id }).session(session);

  if (existingResponse) {
    // If the existing response is "dislike", remove it
    if (existingResponse.response === 'dislike') {
      await CommentResponseModel.deleteOne({ _id: existingResponse._id }, { session });
      return;
    }

    // If the existing response is "like", update it to "dislike"
    await CommentResponseModel.updateOne({ _id: existingResponse._id }, { response: 'dislike' }, { session });
    return;
  }

  // Create a new "dislike" response
  const responseDoc = new CommentResponseModel({ comment_id, user_id, response: 'dislike' });
  await responseDoc.save({ session });
};

export const calculateCommentLikesDislikesService = async (comment_id: string) => {
  const likesCount = await CommentResponseModel.countDocuments({
    comment_id,
    response: 'like',
  });

  const dislikesCount = await CommentResponseModel.countDocuments({
    comment_id,
    response: 'dislike',
  });

  return { likes: likesCount, dislikes: dislikesCount };
};
