import type { Identity } from "@dfinity/agent";
import {
  EmptyResponse,
  GovernanceCanister,
  GovernanceError,
  ListProposalsResponse,
  ProposalId,
  ProposalInfo,
  Topic,
  Vote,
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

  if (proposals.length === 0) {
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
export const getProposal = async ({
  proposalId,
  identity,
}: {
  proposalId: ProposalId;
  identity: Identity | null | undefined;
}): Promise<ProposalInfo | undefined> => {
  const proposal = get(proposalsStore).find(({ id }) => id === proposalId);
  return proposal || queryProposal({ proposalId, identity });
};

const queryProposal = async ({
  proposalId,
  identity,
}: {
  proposalId: ProposalId;
  identity: Identity | null | undefined;
}): Promise<ProposalInfo | undefined> => {
  if (!identity) {
    throw new Error(get(i18n).error.missing_identity);
  }

  const governance: GovernanceCanister = GovernanceCanister.create({
    agent: await createAgent({ identity, host: process.env.HOST }),
  });

  return governance.getProposal({ proposalId });
};

export const getProposalId = (path: string): ProposalId | undefined => {
  const pathDetail = path.split("/").pop();
  if (pathDetail === undefined) {
    return;
  }
  const id = parseInt(pathDetail, 10);
  // ignore not integer ids
  return isFinite(id) && `${id}` === pathDetail ? BigInt(id) : undefined;
};

/**
 * Makes multiple registerVote calls (1 per neuronId).
 * @returns List of errors (order is preserved)
 */
export const castVote = async ({
  neuronIds,
  proposalId,
  vote,
  identity,
}: {
  neuronIds: bigint[];
  proposalId: ProposalId;
  vote: Vote;
  identity: Identity | null | undefined;
}): Promise<Array<GovernanceError | undefined>> => {
  if (!identity) {
    throw new Error(get(i18n).error.missing_identity);
  }

  const governance: GovernanceCanister = GovernanceCanister.create({
    agent: await createAgent({ identity, host: process.env.HOST }),
  });
  return Promise.all(
    neuronIds.map((neuronId) =>
      (
        governance.registerVote({
          neuronId,
          vote,
          proposalId,
        }) as Promise<EmptyResponse>
      ).then((res) => ("Err" in res ? res.Err : undefined))
    )
  );
};
