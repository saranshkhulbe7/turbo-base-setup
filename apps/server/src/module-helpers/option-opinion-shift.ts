import { OpinionModel, OptionOpinionShiftModel, type OptionOpinionShiftCreateType } from '@/db/models';
import type { ClientSession } from 'mongoose';

// Service to create an OptionOpinionShift
export const createOptionOpinionShiftService = async (data: OptionOpinionShiftCreateType, session: ClientSession) => {
  // Check opinion_id validity
  const opinion = await OpinionModel.findOne({ _id: data.opinion_id, archivedAt: null }).session(session);
  if (!opinion) {
    throw new Error(`Opinion with ID ${data.opinion_id} not found or is archived.`);
  }

  const optionOpinionShift = new OptionOpinionShiftModel(data);
  await optionOpinionShift.save({ session });
  return optionOpinionShift;
};

// Service to delete an OptionOpinionShift by option_id and opinion_id (soft delete)
export const deleteOptionOpinionShiftService = async (option_id: string, opinion_id: string, session: ClientSession) => {
  const optionOpinionShift = await OptionOpinionShiftModel.findOne({ option_id, opinion_id, archivedAt: null }).session(session);

  if (!optionOpinionShift) {
    throw new Error(`OptionOpinionShift with option_id ${option_id} and opinion_id ${opinion_id} not found or already archived.`);
  }

  await OptionOpinionShiftModel.softDelete(optionOpinionShift._id.toString(), { session });

  return optionOpinionShift;
};

// Service to get all OptionOpinionShifts by option_id
export const getAllOpinionShiftsByOptionService = async (option_id: string) => {
  return OptionOpinionShiftModel.find({ option_id, archivedAt: null });
};
