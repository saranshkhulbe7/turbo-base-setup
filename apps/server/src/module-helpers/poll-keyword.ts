import { PollKeywordModel, PollModel, KeywordModel, type PollKeywordCreateType } from '@/db/models';
import type { ClientSession } from 'mongoose';

export const getAllPollKeywords = async () => PollKeywordModel.find({ isArchived: false });

export const getPollKeywordsByPollId = async (poll_id: string) => PollKeywordModel.find({ poll_id, isArchived: false });

export const getPollKeywordsByKeywordId = async (keyword_id: string) => PollKeywordModel.find({ keyword_id, isArchived: false });

export const createPollKeyword = async (data: PollKeywordCreateType, session: ClientSession) => {
  const pollKeyword = new PollKeywordModel(data);
  await pollKeyword.save({ session });

  // Update `keywordFamilies` in the Poll model
  await updateKeywordFamiliesForPoll(data.poll_id, session);

  return pollKeyword;
};

export const deletePollKeywordService = async (poll_id: string, keyword_id: string, session: ClientSession) => {
  const pollKeyword = await PollKeywordModel.findOne({ poll_id, keyword_id, archivedAt: null }).session(session);

  if (!pollKeyword) {
    throw new Error(`PollKeyword with poll_id ${poll_id} and keyword_id ${keyword_id} not found or already archived.`);
  }

  await PollKeywordModel.softDelete(pollKeyword._id.toString(), { session });

  // Update `keywordFamilies` in the Poll model
  await updateKeywordFamiliesForPoll(poll_id, session);

  return pollKeyword;
};

// Helper function to update `keywordFamilies` in the Poll model
export const updateKeywordFamiliesForPoll = async (poll_id: string, session: ClientSession) => {
  // Get all active keywords for the poll
  const pollKeywords = await PollKeywordModel.find({ poll_id, isArchived: false }).session(session);

  const uniqueKeywordIds = [...new Set(pollKeywords.map((pk) => pk.keyword_id.toString()))];

  // Fetch the keyword families associated with these keywords
  const keywordFamilies = await KeywordModel.find({
    _id: { $in: uniqueKeywordIds },
    archivedAt: null,
  })
    .select('keywordFamily_id')
    .session(session);

  const uniqueKeywordFamilyIds = [...new Set(keywordFamilies.map((kf) => kf.keywordFamily_id.toString()))];

  // Update the Poll model
  await PollModel.findOneAndUpdate({ _id: poll_id, archivedAt: null }, { $set: { keywordFamilies: uniqueKeywordFamilyIds } }, { session });
};
