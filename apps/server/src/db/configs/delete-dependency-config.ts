interface Dependency {
  model: string; // The name of the related model
  field: string; // The field in the dependent model that references this model
}

export interface DependencyConfig {
  cascade?: Dependency[]; // Dependencies to be soft-deleted when the parent is deleted
  prevent?: Dependency[]; // Dependencies that prevent deletion if they exist
}

export const deleteDependencyConfig: Record<string, DependencyConfig> = {
  User: {
    prevent: [
      { model: 'Transaction', field: 'user_id' },
      { model: 'Poll', field: 'pollOwnership.user_id' },
      { model: 'Comment', field: 'user_id' },
      { model: 'CommentResponse', field: 'user_id' },
      { model: 'Interaction', field: 'user_id' },
      { model: 'UserKeywordFamilyWeight', field: 'user_id' },
    ],
  },
  Admin: {
    prevent: [{ model: 'Poll', field: 'pollOwnership.adminApproval.actionBy' }],
  },
  Poll: {
    cascade: [
      { model: 'Comment', field: 'poll_id' },
      { model: 'Interaction', field: 'poll_id' },
      { model: 'PollKeyword', field: 'poll_id' },
      { model: 'Option', field: '_poll_id' },
    ],
  },
  Comment: {
    cascade: [{ model: 'CommentResponse', field: 'comment_id' }],
  },
  Keyword: {
    cascade: [{ model: 'PollKeyword', field: 'keyword_id' }],
  },
  Option: {
    cascade: [
      { model: 'OptionOpinionShift', field: 'option_id' },
      { model: 'Interaction', field: 'response.option_id' },
    ],
  },
  KeywordFamily: {
    cascade: [
      { model: 'Keyword', field: 'keywordFamily_id' },
      { model: 'KeywordFamilyRelation', field: 'from_keyword_family_id' },
      { model: 'KeywordFamilyRelation', field: 'to_keyword_family_id' },
      { model: 'LocationKeywordFamilyWeight', field: 'keyword_family_id' },
      { model: 'UserKeywordFamilyWeight', field: 'keyword_family_id' },
    ],
  },
  Location: {
    cascade: [{ model: 'LocationKeywordFamilyWeight', field: 'location_id' }],
  },
  EnergyPackage: {
    prevent: [{ model: 'Transaction', field: 'method.package' }],
  },
};
