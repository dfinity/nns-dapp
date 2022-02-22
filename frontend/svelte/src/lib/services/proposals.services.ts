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
import { routeContext } from "../utils/route.utils";

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

/**
 * Return single proposal from proposalsStore or fetch it (in case of page reload or direct navigation to proposal-detail page)
 */
export const getProposalInfo = async ({
  proposalId,
}: {
  proposalId: ProposalId;
}): Promise<ProposalInfo> => {
  const proposal = get(proposalsStore).find(({ id }) => id === proposalId);
  return proposal || queryProposalInfo({ proposalId });
};

// TODO: switch to NDAPP canister -- https://dfinity.atlassian.net/browse/L2-267
const queryProposalInfo = async ({
  proposalId,
}: {
  proposalId: ProposalId;
}): Promise<ProposalInfo> => {
  const governance: GovernanceCanister = GovernanceCanister.create();
  return governance.getProposalInfo({ proposalId });

/**
 * Parse proposalId from current route.
 *
 * @example
 * "/proposal/123" => 123n
 */
export const proposalIdFromRoute = (): ProposalId | undefined => {
  const routePart = routeContext().split("/").pop();
  const id = parseInt(routePart, 10);

  // ignore not integer ids
  if (isFinite(id) && `${id}` === routePart) {
    return BigInt(id);
  }
};
