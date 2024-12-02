import { type OptionCreateType } from '@/db/models';
import { OptionModel } from '@/db/models/option';
import type { ClientSession } from 'mongoose';

// Service to get all options of a specific poll
export const getAllOptionsByPollService = async (_poll_id: string) => {
  return OptionModel.find({ _poll_id, archivedAt: null });
};

// Service to create an option
export const createOptionService = async (optionData: OptionCreateType, session: ClientSession) => {
  const option = new OptionModel(optionData);
  await option.save({ session });
  return option;
};

// Service to delete an option (soft delete)
export const deleteOptionService = async (_id: string, session: ClientSession) => {
  return OptionModel.softDelete(_id, { session });
};
