import type { Identity } from "@dfinity/agent";
import {
  GovernanceCanister,
  ListProposalsResponse,
  ProposalId,
  ProposalInfo,
} from "@dfinity/nns";
import { get } from "svelte/store";
import { LIST_PAGINATION_LIMIT } from "../constants/constants";
import {
  proposalsFiltersStore,
  ProposalsFiltersStore,
  proposalsStore,
} from "../stores/proposals.store";
import { createAgent } from "../utils/agent.utils";

export const listProposals = async ({
  clearBeforeQuery = false,
  identity,
}: {
  clearBeforeQuery?: boolean;
  identity: Identity | null | undefined;
}) => {
  if (clearBeforeQuery) {
    proposalsStore.setProposals([]);
  }

  const proposals: ProposalInfo[] = await queryProposals({
    beforeProposal: undefined,
    identity,
  });

  proposalsStore.setProposals(proposals);
};

export const listNextProposals = async ({
  beforeProposal,
  identity,
}: {
  beforeProposal: ProposalId | undefined;
  identity: Identity | null | undefined;
}) => {
  const proposals: ProposalInfo[] = await queryProposals({
    beforeProposal,
    identity,
  });

  if (!proposals.length) {
    // There is no more proposals to fetch for the current filters.
    // We do not update the store with empty ([]) otherwise it will re-render the component and therefore triggers the Infinite Scrolling again.
    return;
  }

  proposalsStore.pushProposals(proposals);
};

const queryProposals = async ({
  beforeProposal,
  identity,
}: {
  beforeProposal: ProposalId | undefined;
  identity: Identity | null | undefined;
}): Promise<ProposalInfo[]> => {
  // If no identity is provided, we do not fetch any proposals. We have an identical pattern in accounts.
  if (!identity) {
    return [];
  }

  const governance: GovernanceCanister = GovernanceCanister.create({
    agent: await createAgent({ identity, host: process.env.HOST }),
  });

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
