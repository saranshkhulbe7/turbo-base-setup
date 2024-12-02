import { InteractionModel, PollModel, UserModel, type InteractionCreateType } from '@/db/models';
import { Types, type ClientSession } from 'mongoose';
import { fetchPoll, markAsUsed } from './poll';
import { fetchUser } from './user';
import { incrementWeight } from './user-keyword-family-weight';
import { OptionModel } from '@/db/models/option';

const handleEnergyValidation = (userEnergy: number, requiredEnergy: number) => {
  if (userEnergy < requiredEnergy) {
    throw new Error('Insufficient energy to respond to this poll.');
  }
};

const calculateCoins = (poll: typeof PollModel.prototype) => {
  const coinsToGain = poll.coins_remaining < poll.coins_rewarded_per_poll ? poll.coins_remaining : poll.coins_rewarded_per_poll;

  return {
    coinsToGain,
    updatedCoinsRemaining: poll.coins_remaining - coinsToGain,
  };
};

const updatePollAndUser = async (
  poll: typeof PollModel.prototype,
  user: typeof UserModel.prototype,
  coinsToGain: number,
  energySpent: number,
  session: ClientSession
) => {
  poll.coins_remaining -= coinsToGain;
  user.energy -= energySpent;
  user.coins += coinsToGain;

  await Promise.all([poll.save({ session }), user.save({ session })]);
};

const incrementKeywordFamilyWeights = async (userId: string, keywordFamilyIds: string[], session: ClientSession) => {
  for (const keywordFamilyId of keywordFamilyIds) {
    await incrementWeight(session, userId, keywordFamilyId, 1);
  }
};

const getOptionDistribution = async (pollId: string, session: ClientSession) => {
  // Fetch all options for the poll
  const options = await OptionModel.find({ _poll_id: pollId, archivedAt: null }).lean().session(session);

  // Fetch all interactions for the poll
  const interactions = await InteractionModel.find({ poll_id: pollId, archivedAt: null }).lean().session(session);

  // Count interactions for each option
  const optionCounts = options.map((option) => {
    const count = interactions.filter((interaction) => interaction.option_id?.toString() === option._id.toString()).length;
    return {
      option_id: option._id,
      count,
      value: option.value,
    };
  });

  // Calculate total interactions for percentage calculation
  const totalInteractions = optionCounts.reduce((sum, option) => sum + option.count, 0);

  // Calculate percentage distribution
  return optionCounts.map((option) => ({
    ...option,
    percentage: totalInteractions ? ((option.count / totalInteractions) * 100).toFixed(2) : '0.00',
  }));
};

// Main service
export const createInteractionService = async (userId: string, input: InteractionCreateType, session: ClientSession) => {
  const { poll_id, option_id } = input;

  // Fetch required resources
  const poll = await fetchPoll(poll_id, session);
  const user = await fetchUser(userId, session);

  // Validate that the option belongs to the specified poll
  if (option_id !== null) {
    const isValidOption = await OptionModel.exists({
      _id: option_id,
      _poll_id: poll_id,
      archivedAt: null,
    }).session(session);
    if (!isValidOption) {
      throw new Error(`Option ${option_id} does not belong to the specified poll ${poll_id} or is archived.`);
    }
  }

  // Find existing interaction
  const existingInteraction = await InteractionModel.findOne({ user_id: userId, poll_id }).session(session);

  if (existingInteraction) {
    if (existingInteraction.option_id !== null) {
      // User has already responded with an option
      const distribution = await getOptionDistribution(poll_id, session);
      return {
        ...existingInteraction.toObject(),
        distribution,
      };
    }

    if (option_id === null) {
      // No option selected, return existing interaction
      await markAsUsed(userId, poll_id);
      return { ...existingInteraction.toObject(), distribution: null };
    }

    // Update the interaction
    handleEnergyValidation(user.energy, poll.energy_reduced_per_poll);
    const { coinsToGain } = calculateCoins(poll);

    existingInteraction.option_id = option_id;
    existingInteraction.coinsGained += coinsToGain;
    existingInteraction.energySpent += poll.energy_reduced_per_poll;

    await Promise.all([updatePollAndUser(poll, user, coinsToGain, poll.energy_reduced_per_poll, session), existingInteraction.save({ session })]);

    // Increment keyword family weights
    await incrementKeywordFamilyWeights(userId, poll.keywordFamilies, session);

    // Mark the poll as used
    await markAsUsed(userId, poll_id);

    const distribution = await getOptionDistribution(poll_id, session);
    return {
      ...existingInteraction.toObject(),
      distribution,
    };
  }

  // Create a new interaction
  if (option_id === null) {
    const interaction = new InteractionModel({
      user_id: new Types.ObjectId(userId),
      poll_id: new Types.ObjectId(poll_id),
      option_id: null,
      coinsGained: 0,
      energySpent: 0,
    });

    await interaction.save({ session });
    await markAsUsed(userId, poll_id);
    return { ...interaction.toObject(), distribution: null };
  }

  handleEnergyValidation(user.energy, poll.energy_reduced_per_poll);
  const { coinsToGain } = calculateCoins(poll);

  const interaction = new InteractionModel({
    user_id: new Types.ObjectId(userId),
    poll_id: new Types.ObjectId(poll_id),
    option_id: new Types.ObjectId(option_id),
    coinsGained: coinsToGain,
    energySpent: poll.energy_reduced_per_poll,
  });

  await Promise.all([updatePollAndUser(poll, user, coinsToGain, poll.energy_reduced_per_poll, session), interaction.save({ session })]);

  // Increment keyword family weights
  await incrementKeywordFamilyWeights(userId, poll.keywordFamilies, session);

  // Mark the poll as used
  await markAsUsed(userId, poll_id);

  const distribution = await getOptionDistribution(poll_id, session);
  return {
    ...interaction.toObject(),
    distribution,
  };
};
