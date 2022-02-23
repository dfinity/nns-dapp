import type { Identity } from "@dfinity/agent";
import {
  GovernanceCanister,
  ListProposalsResponse,
  ProposalId,
  ProposalInfo,
  Topic,
} from "@dfinity/nns";
import { get } from "svelte/store";
import { LIST_PAGINATION_LIMIT } from "../constants/constants";
import { i18n } from "../stores/i18n";
import {
  proposalsFiltersStore,
  ProposalsFiltersStore,
  proposalsStore,
} from "../stores/proposals.store";
import { createAgent } from "../utils/agent.utils";
import { enumsExclude } from "../utils/enum.utils";
import { routeContext } from "../utils/route.utils";

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
  if (!identity) {
    throw new Error(get(i18n).error.missing_identity);
  }

  const governance: GovernanceCanister = GovernanceCanister.create({
    agent: await createAgent({ identity, host: process.env.HOST }),
  });

  const { rewards, status, topics }: ProposalsFiltersStore = get(
    proposalsFiltersStore
  );

  // TODO(L2-206): In Flutter, proposals are sorted on the client side -> this needs to be deferred on backend side if we still want this feature
  // sortedByDescending((element) => element.proposalTimestamp);
  // Governance canister listProposals -> https://github.com/dfinity/ic/blob/5c05a2fe2a7f8863c3772c050ece7e20907c8252/rs/sns/governance/src/governance.rs#L1226

  const { proposals }: ListProposalsResponse = await governance.listProposals({
    request: {
      limit: LIST_PAGINATION_LIMIT,
      beforeProposal,
      excludeTopic: enumsExclude<Topic>({
        obj: Topic as unknown as Topic,
        values: topics,
      }),
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
};

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
  return isFinite(id) && `${id}` === routePart ? BigInt(id) : undefined;
};
