import { InteractionModel, PollModel, UserModel, type PollCreateType } from '@/db/models';
import { UserProposedPollModel } from '@/db/models/user-proposed-poll';
import { Types, type ClientSession } from 'mongoose';
import { createPollKeyword } from './poll-keyword';
import { createOptionService } from './option';
import { createOptionOpinionShiftService } from './option-opinion-shift';
import { OptionModel } from '@/db/models/option';
import { redis } from '@/utils/redis';

export const getAllPollsService = async () => {
  return PollModel.find({ archivedAt: null });
};
export const createPollService = async (pollData: PollCreateType, adminId: string, session: ClientSession) => {
  const {
    title,
    description,
    imageURL,
    user_proposed_poll_id,
    total_coins_assigned,
    coins_rewarded_per_poll,
    energy_reduced_per_poll,
    keywords,
    options,
  } = pollData;

  // Validate UserProposedPoll and deduct coins if applicable
  const userProposedPoll = user_proposed_poll_id
    ? await UserProposedPollModel.findOneAndUpdate(
        { _id: user_proposed_poll_id, archivedAt: null, approvalStatus: { $ne: 'rejected' } },
        { approvalStatus: 'approved' },
        { session, new: true }
      )
    : null;

  if (user_proposed_poll_id && !userProposedPoll) {
    throw new Error('UserProposedPoll not found, is archived, or has been rejected.');
  }

  if (userProposedPoll) {
    const user = await UserModel.findOneAndUpdate(
      { _id: userProposedPoll.user_id, archivedAt: null, coins: { $gte: userProposedPoll.totalCoinsProposed } },
      { $inc: { coins: -userProposedPoll.totalCoinsProposed } },
      { session, new: true }
    );

    if (!user) {
      const userExists = await UserModel.exists({ _id: userProposedPoll.user_id });
      if (!userExists) {
        throw new Error('User not found.');
      }

      const isArchived = await UserModel.exists({ _id: userProposedPoll.user_id, archivedAt: { $ne: null } });
      if (isArchived) {
        throw new Error('User is archived.');
      }

      const hasSufficientCoins = await UserModel.exists({
        _id: userProposedPoll.user_id,
        archivedAt: null,
        coins: { $gte: userProposedPoll.totalCoinsProposed },
      });
      if (!hasSufficientCoins) {
        throw new Error('User does not have sufficient coins.');
      }
    }
  }
  // Create the Poll
  const [poll] = await PollModel.create(
    [
      {
        createdByAdmin_Id: adminId,
        title,
        description,
        imageURL: imageURL || null,
        user_proposed_poll_id: user_proposed_poll_id || null,
        total_coins_assigned,
        coins_remaining: total_coins_assigned,
        coins_rewarded_per_poll,
        energy_reduced_per_poll,
      },
    ],
    { session }
  );

  // Create Poll Keywords if provided
  if (keywords && keywords.length > 0) {
    const pollKeywordsData = keywords.map((keywordId) => ({
      poll_id: poll._id,
      keyword_id: new Types.ObjectId(keywordId),
    }));
    console.log('step 4');
    await Promise.all(pollKeywordsData.map((data) => createPollKeyword(data, session)));
  }

  // Create Options and their Opinion Shifts
  for (const option of options) {
    const opinionIds = new Set();
    for (const shift of option.opinionShifts) {
      if (opinionIds.has(shift.opinion_id)) {
        throw new Error(`Duplicate opinion ID ${shift.opinion_id} found in option ${option.value}`);
      }
      opinionIds.add(shift.opinion_id);
    }

    const createdOption = await createOptionService({ _poll_id: poll._id, value: option.value }, session);
    for (const shift of option.opinionShifts) {
      await createOptionOpinionShiftService(
        {
          option_id: createdOption._id,
          opinion_id: shift.opinion_id,
          shift: shift.shift,
        },
        session
      );
    }
  }
  return poll;
};
export const fetchPoll = async (poll_id: string, session: ClientSession) => {
  const poll = await PollModel.findOne({ _id: poll_id, archivedAt: null }).session(session);
  if (!poll) throw new Error('Poll not found or is archived.');
  return poll;
};

export const fetchPollFromOption = async (option_id: string, session: ClientSession) => {
  const option = await OptionModel.findOne({ _id: option_id, archivedAt: null }).session(session);
  if (!option) throw new Error('Option not found or is archived.');

  const poll = await PollModel.findOne({ _id: option._poll_id, archivedAt: null }).session(session);
  if (!poll) throw new Error('Poll not found or is archived.');

  return poll;
};

export const fetchOrRecalculateNextPoll = async (userId: string) => {
  return fetchNextPollFromRedis(userId).then((nextPoll) => {
    if (nextPoll) return nextPoll;

    // If no usable poll exists, recalculate
    return calculateRelevantPolls(userId).then((recalculationSuccessful) => {
      if (recalculationSuccessful) {
        return fetchNextPollFromRedis(userId); // Retry fetching
      }
      return null; // No polls available
    });
  });
};

export const fetchNextPollFromRedis = async (userId: string) => {
  const userPollsKey = `user:${userId}:polls`;
  const pollsJSON = await redis.get(userPollsKey);

  if (!pollsJSON) return null;

  const polls = JSON.parse(pollsJSON);
  return polls.find((poll) => poll.canUse) || null;
};

export const calculateRelevantPolls = async (userId: string, pollLimit = 50) => {
  return fetchRelevantPolls(userId, pollLimit).then((pollIds) => {
    if (!pollIds || pollIds.length === 0) {
      return false; // No polls to store
    }

    const userPollsKey = `user:${userId}:polls`;
    const redisData = pollIds.map((pollId) => ({ pollId, canUse: true }));

    return redis
      .set(userPollsKey, JSON.stringify(redisData))
      .then(() => redis.expire(userPollsKey, 3600)) // Expire after 1 hour
      .then(() => true);
  });
};

export const fetchRelevantPolls = async (userId: string, limit: number) => {
  // Fetch poll IDs that the user has interacted with
  const interactedPollIds = await InteractionModel.find({ user_id: userId }, { poll_id: 1 })
    .lean()
    .then((interactions) => interactions.map((interaction) => interaction.poll_id.toString()));

  // Fetch polls excluding those with existing interactions
  const polls = await PollModel.find({ _id: { $nin: interactedPollIds }, archivedAt: null })
    .limit(limit)
    .lean();

  // Return only the poll IDs
  return polls.map((poll) => poll._id.toString());
};

export const preparePoll = async (pollId: string) => {
  // Fetch the poll details
  const poll = await PollModel.findOne({ _id: pollId, archivedAt: null }).lean();
  if (!poll) throw new Error(`Poll with ID ${pollId} not found or is archived.`);

  // Calculate the coin reward
  const coinReward = Math.min(poll.coins_rewarded_per_poll, poll.coins_remaining);

  // Fetch poll options
  const options = await OptionModel.find({ _poll_id: pollId, archivedAt: null }).lean();

  // Fetch user details if user_proposed_poll_id is present
  let userDetail = null;
  if (poll.user_proposed_poll_id) {
    console.log('entering');

    // Fetch the user_id from UserProposedPoll
    const userProposedPoll = await UserProposedPollModel.findOne(
      { _id: poll.user_proposed_poll_id, archivedAt: null }, // Match the specific proposed poll ID
      { user_id: 1 } // Fetch only the user_id field
    ).lean();

    if (userProposedPoll?.user_id) {
      // Fetch user details using the retrieved user_id
      userDetail = await UserModel.findOne(
        { _id: userProposedPoll.user_id, archivedAt: null },
        { name: 1, level: 1, bgColor: 1 } // Fetch only relevant fields
      ).lean();
      console.log('user details', userDetail);
    } else {
      console.log('No user found for the proposed poll.');
    }
  }
  // Prepare the poll data
  return {
    _id: pollId,
    title: poll.title,
    description: poll.description,
    image: poll.imageURL,
    options: options.map((option) => ({
      _id: option._id.toString(),
      value: option.value,
    })),
    coinReward,
    energyReduced: poll.energy_reduced_per_poll,
    userProposedDetails: userDetail,
  };
};

export const markAsUsed = async (userId: string, pollId: string): Promise<void> => {
  const userPollsKey = `user:${userId}:polls`;

  // Fetch the polls from Redis
  const pollsJSON = await redis.get(userPollsKey);

  if (!pollsJSON) {
    // No data in Redis, nothing to update
    return;
  }

  const polls = JSON.parse(pollsJSON);

  // Find the poll and mark as used
  const updatedPolls = polls.map((poll: { pollId: string; canUse: boolean }) => (poll.pollId === pollId ? { ...poll, canUse: false } : poll));

  // Save the updated data back to Redis
  await redis.set(userPollsKey, JSON.stringify(updatedPolls));
};

export const deletePollService = async (_id: string, session: ClientSession) => {
  return PollModel.softDelete(_id, { session });
};
