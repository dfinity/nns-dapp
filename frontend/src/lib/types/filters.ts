import type { SnsNervousSystemFunction } from "@dfinity/sns";

export const SNS_SPECIFIC_PROPOSAL_TYPE_ID = "sns_specific";
export type SnsProposalTypeFilterData =
  | SnsNervousSystemFunction
  | typeof SNS_SPECIFIC_PROPOSAL_TYPE_ID;

export type Filter<T> = {
  name: string;
  value: T;
  id: string;
  checked: boolean;
};
