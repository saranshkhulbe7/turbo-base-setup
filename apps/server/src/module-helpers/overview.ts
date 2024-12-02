import { UserModel, PollModel, InteractionModel } from '@/db/models';
import dayjs from 'dayjs';

export const getOverviewService = async () => {
  // 1. Total unarchived users
  const userCount = await UserModel.countDocuments({ archivedAt: null });

  // 2. Total unarchived polls
  const pollCount = await PollModel.countDocuments({ archivedAt: null });

  // 3. Total unarchived users by levels
  const userLevels = await UserModel.aggregate([{ $match: { archivedAt: null } }, { $group: { _id: '$level', count: { $sum: 1 } } }]);

  const levelCounts = {
    level_1: userLevels.find((l) => l._id === 1)?.count || 0,
    level_2: userLevels.find((l) => l._id === 2)?.count || 0,
    level_3: userLevels.find((l) => l._id === 3)?.count || 0,
  };

  // 4. Total coins with users
  const totalCoins = await UserModel.aggregate([{ $match: { archivedAt: null } }, { $group: { _id: null, totalCoins: { $sum: '$coins' } } }]);

  const coins = totalCoins[0]?.totalCoins || 0;

  // 5. Total energy with users
  const totalEnergy = await UserModel.aggregate([{ $match: { archivedAt: null } }, { $group: { _id: null, totalEnergy: { $sum: '$energy' } } }]);

  const energy = totalEnergy[0]?.totalEnergy || 0;

  // Date Ranges
  const now = dayjs();
  const lastMonthRange = {
    start: now.subtract(1, 'month').startOf('month').toDate(),
    end: now.subtract(1, 'month').endOf('month').toDate(),
  };
  const currentMonthRange = {
    start: now.startOf('month').toDate(),
    end: now.endOf('month').toDate(),
  };

  const lastWeekRange = {
    start: now.subtract(1, 'week').startOf('week').toDate(),
    end: now.subtract(1, 'week').endOf('week').toDate(),
  };
  const currentWeekRange = {
    start: now.startOf('week').toDate(),
    end: now.endOf('week').toDate(),
  };

  const lastYearRange = {
    start: now.subtract(1, 'year').startOf('year').toDate(),
    end: now.subtract(1, 'year').endOf('year').toDate(),
  };
  const currentYearRange = {
    start: now.startOf('year').toDate(),
    end: now.endOf('year').toDate(),
  };

  // 6. Monthly interactions
  const lastMonthInteractions = await InteractionModel.countDocuments({
    option_id: null,
    archivedAt: null,
    createdAt: { $gte: lastMonthRange.start, $lte: lastMonthRange.end },
  });

  const currentMonthInteractions = await InteractionModel.countDocuments({
    option_id: null,
    archivedAt: null,
    createdAt: { $gte: currentMonthRange.start, $lte: currentMonthRange.end },
  });

  const monthPercentageChange =
    lastMonthInteractions === 0
      ? currentMonthInteractions > 0
        ? '+100%'
        : '0%'
      : `${(((currentMonthInteractions - lastMonthInteractions) / lastMonthInteractions) * 100).toFixed(2)}%`;

  // 7. Weekly interactions
  const lastWeekInteractions = await InteractionModel.countDocuments({
    option_id: null,
    archivedAt: null,
    createdAt: { $gte: lastWeekRange.start, $lte: lastWeekRange.end },
  });

  const currentWeekInteractions = await InteractionModel.countDocuments({
    option_id: null,
    archivedAt: null,
    createdAt: { $gte: currentWeekRange.start, $lte: currentWeekRange.end },
  });

  const weekPercentageChange =
    lastWeekInteractions === 0
      ? currentWeekInteractions > 0
        ? '+100%'
        : '0%'
      : `${(((currentWeekInteractions - lastWeekInteractions) / lastWeekInteractions) * 100).toFixed(2)}%`;

  // 8. Yearly interactions
  const lastYearInteractions = await InteractionModel.countDocuments({
    option_id: null,
    archivedAt: null,
    createdAt: { $gte: lastYearRange.start, $lte: lastYearRange.end },
  });

  const currentYearInteractions = await InteractionModel.countDocuments({
    option_id: null,
    archivedAt: null,
    createdAt: { $gte: currentYearRange.start, $lte: currentYearRange.end },
  });

  const yearPercentageChange =
    lastYearInteractions === 0
      ? currentYearInteractions > 0
        ? '+100%'
        : '0%'
      : `${(((currentYearInteractions - lastYearInteractions) / lastYearInteractions) * 100).toFixed(2)}%`;

  return {
    user_count: userCount,
    poll_count: pollCount,
    level_counts: levelCounts,
    total_coins: coins,
    total_energy: energy,
    interactions: {
      monthly: {
        last_month: lastMonthInteractions,
        current_month: currentMonthInteractions,
        percentage_change: monthPercentageChange,
      },
      weekly: {
        last_week: lastWeekInteractions,
        current_week: currentWeekInteractions,
        percentage_change: weekPercentageChange,
      },
      yearly: {
        last_year: lastYearInteractions,
        current_year: currentYearInteractions,
        percentage_change: yearPercentageChange,
      },
    },
  };
};
