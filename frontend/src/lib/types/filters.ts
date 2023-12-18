// artificial proposal type id to filter by all generic SNS types
export const ALL_GENERIC_PROPOSAL_TYPES_ID = "sns_specific";

export type SnsProposalTypeFilterData =
  | keyof I18nSns_types
  | typeof ALL_GENERIC_PROPOSAL_TYPES_ID;

export type Filter<T> = {
  name: string;
  value: T;
  id: string;
  checked: boolean;
};
