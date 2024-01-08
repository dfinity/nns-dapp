// artificial proposal type id to filter by all generic SNS types
export const ALL_SNS_GENERIC_PROPOSAL_TYPES_ID = "all_sns_generic_types";

// Stringified nsFunction id.
export type SnsProposalTypeFilterId =
  | string
  | typeof ALL_SNS_GENERIC_PROPOSAL_TYPES_ID;

export type Filter<T> = {
  name: string;
  value: T;
  id: string;
  checked: boolean;
};
