import { UserProposedPollModel, type IUserProposedPoll } from '@/db/models/user-proposed-poll';
import type { ClientSession } from 'mongoose';

export const createUserProposedPollService = async (
  userId: string,
  pollData: { title: string; description: string; imageURL?: string; options: string[]; totalCoinsProposed: number },
  session: ClientSession
): Promise<IUserProposedPoll> => {
  const poll = new UserProposedPollModel({
    ...pollData,
    user_id: userId,
    approvalStatus: 'pending', // Default approval status
  });

  await poll.save({ session });
  return poll;
};

export const getAllUserProposedPollsService = async (userId: string) => {
  return UserProposedPollModel.find({ user_id: userId, archivedAt: null });
};

export const getUserProposedPollByIdService = async (userId: string, pollId: string) => {
  return UserProposedPollModel.findOne({ _id: pollId, user_id: userId, archivedAt: null });
};
