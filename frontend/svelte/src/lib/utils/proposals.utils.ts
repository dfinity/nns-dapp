import type { ListProposalsResponse } from "@dfinity/nns";
import { GovernanceCanister, ProposalId, ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import { LIST_PAGINATION_LIMIT } from "../constants/constants";
import {
  ProposalsFiltersStore,
  proposalsFiltersStore,
  proposalsStore,
} from "../stores/proposals.store";

// TODO(L2-206): refactor / rename to "providers" or "services"

export const emptyProposals = (): boolean => {
  const { length }: ProposalInfo[] = get(proposalsStore);
  return length <= 0;
};

export const lastProposalId = (): ProposalId | undefined => {
  const { length, [length - 1]: last } = get(proposalsStore);
  return last?.id;
};

export const listProposals = async ({
  clearBeforeQuery = false,
}: {
  clearBeforeQuery?: boolean;
}) => {
  if (clearBeforeQuery) {
    proposalsStore.setProposals([]);
  }

  const proposals: ProposalInfo[] = await queryProposals({
    beforeProposal: undefined,
  });

  proposalsStore.setProposals(proposals);
};

export const listNextProposals = async ({
  beforeProposal,
}: {
  beforeProposal: ProposalId | undefined;
}) => {
  const proposals: ProposalInfo[] = await queryProposals({ beforeProposal });

  if (!proposals.length) {
    // There is no more proposals to fetch for the current filters.
    // We do not update the store with empty ([]) otherwise it will re-render the component and therefore triggers the Infinite Scrolling again.
    return;
  }

  proposalsStore.pushProposals(proposals);
};

const queryProposals = async ({
  beforeProposal,
}: {
  beforeProposal: ProposalId | undefined;
}): Promise<ProposalInfo[]> => {
  // TODO(L2-206): use createAgent
  const governance: GovernanceCanister = GovernanceCanister.create();

  const { rewards, status }: ProposalsFiltersStore = get(proposalsFiltersStore);

  // TODO(L2-206): implement excludeTopic
  // TODO(L2-2069: implement 'Hide "Open" proposals where all your neurons have voted or are ineligible to vote'

  const { proposals }: ListProposalsResponse = await governance.listProposals({
    request: {
      limit: LIST_PAGINATION_LIMIT,
      beforeProposal,
      excludeTopic: [],
      includeRewardStatus: rewards,
      includeStatus: status,
    },
  });

  return proposals;
};
