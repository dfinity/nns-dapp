// artificial proposal type id to filter by all generic SNS types
export const ALL_SNS_GENERIC_PROPOSAL_TYPES_ID = "all_sns_generic_types";

// Stringified nsFunction id.
export type SnsProposalTypeFilterId =
  | string
  | typeof ALL_SNS_GENERIC_PROPOSAL_TYPES_ID;

export type NnsProposalFilterCategory = "topics" | "status" | "uncategorized";
export type SnsFilterCategory = "topics" | "types";

export type ALL_SNS_GENERIC_PROPOSAL_TOPICS_ID = "all_sns_generic_topics";

export type SnsProposalTopicFilterId =
  | string
  | ALL_SNS_GENERIC_PROPOSAL_TOPICS_ID;

export type Filter<T> = {
  name: string;
  value: T;
  id: string;
  checked: boolean;
  isCritical?: boolean;
};
