import { UserKeywordFamilyWeightModel, type UserKeywordFamilyWeightCreate } from '@/db/models';
import { UserModel } from '@/db/models/user';
import type { ClientSession } from 'mongoose';

// Create a new UserKeywordFamilyWeight document
export const createUserKeywordFamilyWeight = async (session: ClientSession, userData: UserKeywordFamilyWeightCreate) => {
  const doc = new UserKeywordFamilyWeightModel(userData);
  await doc.save({ session });
  return doc;
};

// Increment weight for a given user and keyword family
export const incrementWeight = async (session: ClientSession, user_id: string, keyword_family_id: string, incrementBy = 1) => {
  const result = await UserKeywordFamilyWeightModel.findOneAndUpdate(
    { user_id, keyword_family_id },
    { $inc: { weight: incrementBy } },
    { new: true, upsert: true, session }
  );
  return result;
};

// Decrement weight for a given user and keyword family
export const decrementWeight = async (session: ClientSession, user_id: string, keyword_family_id: string, decrementBy = 1) => {
  const doc = await UserKeywordFamilyWeightModel.findOne({ user_id, keyword_family_id }).session(session);

  if (!doc) {
    const newDoc = new UserKeywordFamilyWeightModel({ user_id, keyword_family_id, weight: 0 });
    await newDoc.save({ session });
    return newDoc;
  }

  doc.weight = Math.max(doc.weight - decrementBy, 0); // Ensure weight doesn't drop below zero
  await doc.save({ session });
  return doc;
};

// Set weight for a specific user and keyword family
export const setWeight = async (session: ClientSession, user_id: string, keyword_family_id: string, weight: number) => {
  if (weight < 0) {
    throw new Error('Weight must be greater than or equal to 0.');
  }

  const result = await UserKeywordFamilyWeightModel.findOneAndUpdate(
    { user_id, keyword_family_id },
    { $set: { weight } },
    { new: true, upsert: true, session }
  );
  return result;
};

// Boost weight for all unarchived users by a given number
export const boostWeightForAllUsers = async (session: ClientSession, keyword_family_id: string, boostBy = 1) => {
  const users = await UserModel.find({ archivedAt: null }).session(session);

  for (const user of users) {
    const existingRelation = await UserKeywordFamilyWeightModel.findOne({
      user_id: user._id,
      keyword_family_id,
    }).session(session);

    if (existingRelation) {
      existingRelation.weight += boostBy;
      await existingRelation.save({ session });
    } else {
      const newRelation = new UserKeywordFamilyWeightModel({
        user_id: user._id,
        keyword_family_id,
        weight: boostBy,
      });
      await newRelation.save({ session });
    }
  }
};

// Unboost weight for all unarchived users by a given number
export const unboostWeightForAllUsers = async (session: ClientSession, keyword_family_id: string, unboostBy = 1) => {
  const users = await UserModel.find({ archivedAt: null }).session(session);

  for (const user of users) {
    const existingRelation = await UserKeywordFamilyWeightModel.findOne({
      user_id: user._id,
      keyword_family_id,
    }).session(session);

    if (existingRelation) {
      existingRelation.weight = Math.max(existingRelation.weight - unboostBy, 0);
      await existingRelation.save({ session });
    } else {
      const newRelation = new UserKeywordFamilyWeightModel({
        user_id: user._id,
        keyword_family_id,
        weight: 0,
      });
      await newRelation.save({ session });
    }
  }
};

// Set a specific weight for all users for a keyword family
export const setWeightForAllUsers = async (session: ClientSession, keyword_family_id: string, weight: number) => {
  if (weight < 0) {
    throw new Error('Weight must be greater than or equal to 0.');
  }

  const users = await UserModel.find({ archivedAt: null }).session(session);

  for (const user of users) {
    await UserKeywordFamilyWeightModel.findOneAndUpdate(
      { user_id: user._id, keyword_family_id },
      { $set: { weight } },
      { new: true, upsert: true, session }
    );
  }
};
