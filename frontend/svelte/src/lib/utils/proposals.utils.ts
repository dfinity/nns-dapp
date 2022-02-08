import type { ListProposalsResponse } from "@dfinity/nns";
import { GovernanceCanister, ProposalId, ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import { LIST_PAGINATION_LIMIT } from "../constants/constants";
import { ProposalsStore, proposalsStore } from "../stores/proposals.store";

export const emptyProposals = (): boolean => {
  const { proposals }: ProposalsStore = get(proposalsStore);
  const { length }: ProposalInfo[] = proposals;
  return length <= 0;
};

export const lastProposalId = (): ProposalId | undefined => {
  const { proposals }: ProposalsStore = get(proposalsStore);
  const { length, [length - 1]: last } = proposals;
  return last?.id;
};

// TODO: certified?
export const listProposals = async ({
  beforeProposal,
}: {
  beforeProposal: ProposalId | undefined;
}) => {
  const governance: GovernanceCanister = GovernanceCanister.create();

  const { proposals }: ListProposalsResponse = await governance.listProposals(
    {
      limit: LIST_PAGINATION_LIMIT,
      beforeProposal,
      excludeTopic: [],
      includeRewardStatus: [],
      includeStatus: [],
    },
    false
  );

  proposalsStore.pushProposals(proposals);
};
