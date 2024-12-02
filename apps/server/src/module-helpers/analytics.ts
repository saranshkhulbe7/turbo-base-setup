import { redis } from '@/utils/redis';
import { OptionOpinionShiftModel } from '@/db/models/option-opinion-shift';
import { InteractionModel } from '@/db/models/interaction';
import { PollModel } from '@/db/models/poll';
import { OptionModel } from '@/db/models/option';
import mongoose from 'mongoose';

export const getOpinionDistributionService = async (opinionId: string, keywordFamilyIds: string[], filters?: { user_id?: string }) => {
  const cacheKey = `opinion:${opinionId}:keywords:${keywordFamilyIds.sort().join(',')}:filters:${filters?.user_id || 'all'}`;

  // Check Redis cache
  // const cachedResult = await redis.get(cacheKey);
  // if (cachedResult) return JSON.parse(cachedResult);

  // Fetch opinion shifts and build option-shift map
  const opinionShifts = await OptionOpinionShiftModel.find({ opinion_id: opinionId }).lean();
  const optionShiftMap = opinionShifts.reduce((acc, { option_id, shift }) => ({ ...acc, [option_id]: shift }), {} as Record<string, string>);

  // Build interaction query
  const interactionQuery: Record<string, any> = {
    option_id: { $in: Object.keys(optionShiftMap) },
  };
  if (filters?.user_id) {
    interactionQuery.user_id = filters.user_id; // Add user_id filter if provided
  }

  // Fetch interactions for relevant options
  const interactions = await InteractionModel.find(interactionQuery).lean();

  // Count interactions by shift
  const optionCounts = interactions.reduce((acc, { option_id }) => {
    const shift = optionShiftMap[option_id];
    if (shift) {
      acc[option_id] = acc[option_id] || { positive: 0, negative: 0, neutral: 0 };
      acc[option_id][shift]++;
    }
    return acc;
  }, {} as Record<string, Record<string, number>>);

  // Map options to polls
  const options = await OptionModel.find({ _id: { $in: Object.keys(optionCounts) } })
    .select('_id _poll_id')
    .lean();
  const optionToPollMap = options.reduce(
    (acc, { _id, _poll_id }) => ({ ...acc, [_id.toString()]: _poll_id.toString() }),
    {} as Record<string, string>
  );

  // Fetch polls and filter by keyword families
  const polls = await PollModel.find({ _id: { $in: Object.values(optionToPollMap) } })
    .select('_id keywordFamilies')
    .lean();

  const filteredPolls = polls.filter((poll) =>
    keywordFamilyIds.every((kfId) => poll.keywordFamilies.some((familyId) => familyId.toString() === kfId))
  );

  // Aggregate counts for filtered polls
  const pollCounts = filteredPolls.reduce(
    (acc, poll) => {
      const pollOptions = options.filter((option) => optionToPollMap[option._id.toString()] === poll._id.toString());
      pollOptions.forEach(({ _id }) => {
        const counts = optionCounts[_id.toString()] || { positive: 0, negative: 0, neutral: 0 };
        acc.positive += counts.positive;
        acc.negative += counts.negative;
        acc.neutral += counts.neutral;
      });
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );

  // Calculate uninterested count
  const uninterestedInteractionQuery: Record<string, any> = { option_id: null };
  if (filters?.user_id) {
    uninterestedInteractionQuery.user_id = filters.user_id; // Add user_id filter if provided
  }
  const uninterestedInteractions = await InteractionModel.aggregate([
    { $match: uninterestedInteractionQuery },
    { $group: { _id: '$poll_id', count: { $sum: 1 } } },
  ]);

  const uninterestedPolls = await PollModel.find({
    _id: { $in: uninterestedInteractions.map((interaction) => interaction._id) },
  })
    .select('_id keywordFamilies')
    .lean();

  const filteredUninterestedPolls = uninterestedPolls.filter((poll) =>
    keywordFamilyIds.every((kfId) => poll.keywordFamilies.some((familyId) => familyId.toString() === kfId))
  );

  const uninterestedCount = uninterestedInteractions
    .filter((interaction) => filteredUninterestedPolls.some((poll) => poll._id.toString() === interaction._id.toString()))
    .reduce((total, interaction) => total + interaction.count, 0);

  // Final aggregation
  const totalCount = pollCounts.positive + pollCounts.negative + pollCounts.neutral + uninterestedCount;

  const distribution = {
    positive: { count: pollCounts.positive, percentage: totalCount ? (pollCounts.positive / totalCount) * 100 : 0 },
    negative: { count: pollCounts.negative, percentage: totalCount ? (pollCounts.negative / totalCount) * 100 : 0 },
    neutral: { count: pollCounts.neutral, percentage: totalCount ? (pollCounts.neutral / totalCount) * 100 : 0 },
    uninterested: { count: uninterestedCount, percentage: totalCount ? (uninterestedCount / totalCount) * 100 : 0 },
  };

  // Cache result
  // await redis.set(cacheKey, JSON.stringify(distribution), 'EX', 3600); // 1-hour cache

  return distribution;
};
