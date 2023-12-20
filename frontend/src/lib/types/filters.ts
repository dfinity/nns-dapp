// artificial proposal type id to filter by all generic SNS types
export const ALL_GENERIC_PROPOSAL_TYPES_ID = "sns_specific";

// Stringified nsFunction id.
export type SnsProposalTypeFilterId =
  | string
  | typeof ALL_GENERIC_PROPOSAL_TYPES_ID;

export type Filter<T> = {
  name: string;
  value: T;
  id: string;
  checked: boolean;
};
