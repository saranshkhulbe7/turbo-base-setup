import { KeywordFamilyModel, KeywordFamilyRelationModel } from '@/db/models';
import { Types, type ClientSession } from 'mongoose';

// Fetch all relations
export const getAllKeywordFamilyRelationsService = async () => {
  return KeywordFamilyRelationModel.find({ archivedAt: null });
};

export const getRelationsByFromKeywordFamilyService = async (keywordFamilyId: string) => {
  const objectId = new Types.ObjectId(keywordFamilyId);

  // Query for all unarchived relations where `from_keyword_family_id` matches the given ID
  const relations = await KeywordFamilyRelationModel.find({
    from_keyword_family_id: objectId,
    archivedAt: null,
  })
    .populate({
      path: 'to_keyword_family_id', // Path to populate
      select: 'name', // Select only the `name` field from the related KeywordFamily
      model: KeywordFamilyModel, // Specify the model to use
    })
    .lean();

  // Format the result
  return relations.map((relation) => ({
    to_keyword_family_id: relation.to_keyword_family_id._id,
    name: relation.to_keyword_family_id.name, // Access the populated name
  }));
};

// Create multiple relations with opposite entry logic
export const createKeywordFamilyRelationsService = async (
  from_keyword_family_id: string,
  to_keyword_family_ids: string[],
  session: ClientSession
) => {
  const createdRelations = [];

  for (const to_keyword_family_id of to_keyword_family_ids) {
    // Check if the current relation already exists
    const existingRelation = await KeywordFamilyRelationModel.findOne({
      from_keyword_family_id,
      to_keyword_family_id,
      archivedAt: null,
    }).session(session);

    if (!existingRelation) {
      // Create the main relation
      const relation = new KeywordFamilyRelationModel({
        from_keyword_family_id,
        to_keyword_family_id,
      });
      await relation.save({ session });
      createdRelations.push(relation);
    }

    // Check if the opposite relation already exists
    const existingOppositeRelation = await KeywordFamilyRelationModel.findOne({
      from_keyword_family_id: to_keyword_family_id,
      to_keyword_family_id: from_keyword_family_id,
      archivedAt: null,
    }).session(session);

    if (!existingOppositeRelation) {
      // Create the opposite relation
      const reverseRelation = new KeywordFamilyRelationModel({
        from_keyword_family_id: to_keyword_family_id,
        to_keyword_family_id: from_keyword_family_id,
      });
      await reverseRelation.save({ session });
      createdRelations.push(reverseRelation);
    }
  }

  return createdRelations;
};

// Delete multiple relations with opposite entry logic
export const deleteKeywordFamilyRelationsService = async (
  from_keyword_family_id: string,
  to_keyword_family_ids: string[],
  session: ClientSession
) => {
  for (const to_keyword_family_id of to_keyword_family_ids) {
    // Fetch and soft delete the current relation
    const currentRelation = await KeywordFamilyRelationModel.findOne({
      from_keyword_family_id,
      to_keyword_family_id,
      archivedAt: null,
    }).session(session);

    if (currentRelation) {
      await KeywordFamilyRelationModel.softDelete(currentRelation._id.toString(), { session });
    }

    // Fetch and soft delete the opposite relation
    const oppositeRelation = await KeywordFamilyRelationModel.findOne({
      from_keyword_family_id: to_keyword_family_id,
      to_keyword_family_id: from_keyword_family_id,
      archivedAt: null,
    }).session(session);

    if (oppositeRelation) {
      await KeywordFamilyRelationModel.softDelete(oppositeRelation._id.toString(), { session });
    }
  }
};
