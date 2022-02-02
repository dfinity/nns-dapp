import { get } from "svelte/store";
import { GovernanceCanister, ProposalId, ProposalInfo } from "@dfinity/nns";
import type { ListProposalsResponse } from "@dfinity/nns";
import { proposalsStore } from "../stores/proposals.store";

export const emptyProposals = (): boolean => {
    const {length}: ProposalInfo[] = get(proposalsStore);
    return length <= 0;
}

export const lastProposalId = (): ProposalId | undefined => {
  const proposals: ProposalInfo[] = get(proposalsStore);
  const { length, [length - 1]: last } = proposals;
  return last?.id;
};

// TODO: add filter
// TODO: certified?
export const listProposals = async ({
  beforeProposal,
}: {
  beforeProposal: ProposalId | undefined;
}) => {
  const governance: GovernanceCanister = GovernanceCanister.create();

  const { proposals }: ListProposalsResponse = await governance.listProposals(
    {
      limit: 10,
      beforeProposal,
      excludeTopic: [],
      includeRewardStatus: [],
      includeStatus: [],
    },
    false
  );

  proposalsStore.push(proposals);
};
