import type { ListProposalsResponse } from "@dfinity/nns";
import { GovernanceCanister, ProposalId, ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import { LIST_PAGINATION_LIMIT } from "../constants/constants";
import {
  ProposalsFiltersStore,
  proposalsFiltersStore,
  proposalsStore,
} from "../stores/proposals.store";

export const emptyProposals = (): boolean => {
  const { length }: ProposalInfo[] = get(proposalsStore);
  return length <= 0;
};

export const lastProposalId = (): ProposalId | undefined => {
  const { length, [length - 1]: last } = get(proposalsStore);
  return last?.id;
};

// TODO: certified?
export const listProposals = async () => {
    const proposals: ProposalInfo[] = await queryProposals({beforeProposal: undefined});

    proposalsStore.setProposals(proposals);
};

export const listNextProposals = async ({
  beforeProposal,
}: {
  beforeProposal: ProposalId | undefined;
}) => {
    const proposals: ProposalInfo[] = await queryProposals({beforeProposal});

    proposalsStore.pushProposals(proposals);
};

const queryProposals = async ({
  beforeProposal,
}: {
  beforeProposal: ProposalId | undefined;
}): Promise<ProposalInfo[]> => {
  const governance: GovernanceCanister = GovernanceCanister.create();

  const { rewards, status }: ProposalsFiltersStore = get(proposalsFiltersStore);

  // TODO: excludeTopic

  const { proposals }: ListProposalsResponse = await governance.listProposals(
    {
      limit: LIST_PAGINATION_LIMIT,
      beforeProposal,
      excludeTopic: [],
      includeRewardStatus: rewards,
      includeStatus: status,
    },
    false
  );

  return proposals;
};
