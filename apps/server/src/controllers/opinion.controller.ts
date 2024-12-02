import { createOpinionService, deleteOpinionService, getAllOpinionsService, getOpinionByIdService, updateOpinionService } from '@/module-helpers';
import { ApiResponse } from '@/utils/ApiResponse';
import { runInTransaction } from '@/utils/transaction-helper';

import type { Context } from 'hono';

export const getAllOpinions = async (c: Context) => {
  const opinions = await getAllOpinionsService();
  return c.json(new ApiResponse(200, opinions, 'Opinions fetched successfully.'));
};

export const getOpinionById = async (c: Context) => {
  const { _id } = c.req.param();
  const opinion = await getOpinionByIdService(_id);
  if (!opinion) return c.json(new ApiResponse(404, null, `Opinion with ID ${_id} not found.`), 404);
  return c.json(new ApiResponse(200, opinion, 'Opinion fetched successfully.'));
};

export const createOpinion = async (c: Context) => {
  const opinionData = await c.req.json();
  const newOpinion = await runInTransaction(async (session) => createOpinionService(opinionData, session));
  return c.json(new ApiResponse(201, newOpinion, 'Opinion created successfully.'));
};

export const updateOpinion = async (c: Context) => {
  const { _id } = c.req.param();
  const updateData = await c.req.json();
  const updatedOpinion = await runInTransaction(async (session) => updateOpinionService(_id, updateData, session));
  return c.json(new ApiResponse(200, updatedOpinion, 'Opinion updated successfully.'));
};

export const deleteOpinions = async (c: Context) => {
  const { opinionIds } = await c.req.json(); // Expecting an object with "opinionIds" array

  await runInTransaction(async (session) => {
    for (const opinionId of opinionIds) {
      await deleteOpinionService(opinionId, session);
    }
  });

  return c.json(new ApiResponse(200, null, 'Opinions deleted successfully.'));
};
