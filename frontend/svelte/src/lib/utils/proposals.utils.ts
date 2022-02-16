import type { ProposalId, ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import { proposalsStore } from "../stores/proposals.store";

export const emptyProposals = (): boolean => {
  const { length }: ProposalInfo[] = get(proposalsStore);
  return length <= 0;
};

export const lastProposalId = (): ProposalId | undefined => {
  const { length, [length - 1]: last } = get(proposalsStore);
  return last?.id;
};
