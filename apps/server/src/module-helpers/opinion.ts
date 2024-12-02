import { OpinionModel, type OptionCreateType, type OptionUpdateType } from '@/db/models';
import type { ClientSession } from 'mongoose';

export const getAllOpinionsService = async () => {
  return OpinionModel.find({ archivedAt: null });
};

export const getOpinionByIdService = async (_id: string) => {
  return OpinionModel.findOne({ _id, archivedAt: null });
};

export const createOpinionService = async (opinionData: OptionCreateType, session: ClientSession) => {
  const opinion = new OpinionModel(opinionData);
  await opinion.save({ session });
  return opinion;
};

export const updateOpinionService = async (_id: string, updateData: OptionUpdateType, session: ClientSession) => {
  const updatedOpinion = await OpinionModel.findOneAndUpdate({ _id, archivedAt: null }, { $set: updateData }, { new: true, session });
  if (!updatedOpinion) throw new Error(`Opinion with ID ${_id} not found or is archived.`);
  return updatedOpinion;
};

export const deleteOpinionService = async (opinionId: string, session: ClientSession) => {
  return OpinionModel.softDelete(opinionId, { session });
};
