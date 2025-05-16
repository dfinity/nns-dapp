import type { SnsTopicKey } from "$lib/types/sns";
import type { ProposalStatus, Topic } from "@dfinity/nns";
import type { SnsProposalDecisionStatus } from "@dfinity/sns";

// artificial proposal type id to filter by all generic SNS types
export const ALL_SNS_GENERIC_PROPOSAL_TYPES_ID = "all_sns_generic_types";

// Stringified nsFunction id.
export type SnsProposalTypeFilterId =
  | string
  | typeof ALL_SNS_GENERIC_PROPOSAL_TYPES_ID;

export type NnsProposalFilterCategory = "topics" | "status" | "uncategorized";
export type SnsProposalFilterCategory = "topics" | "types";

// artificial proposal type id to filter by SNSs without topics
export const ALL_SNS_PROPOSALS_WITHOUT_TOPIC =
  "all_sns_proposals_without_topic" as const;
export type SnsProposalTopicFilterId =
  | SnsTopicKey
  | typeof ALL_SNS_PROPOSALS_WITHOUT_TOPIC;

export type Filter<T> = {
  name: string;
  value: T;
  id: string;
  checked: boolean;
  isCritical?: boolean;
};

export type FiltersData =
  | SnsProposalTypeFilterId
  | Topic
  | ProposalStatus
  | SnsProposalDecisionStatus;
