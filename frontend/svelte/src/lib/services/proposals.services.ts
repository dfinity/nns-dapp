import type { Identity } from "@dfinity/agent";
import type {
  GovernanceError,
  NeuronId,
  ProposalId,
  ProposalInfo,
  Vote,
} from "@dfinity/nns";
import { get } from "svelte/store";
import {
  queryProposal,
  queryProposals,
  registerVote,
} from "../api/proposals.api";
import { i18n } from "../stores/i18n";
import {
  proposalsFiltersStore,
  ProposalsFiltersStore,
  proposalsStore,
} from "../stores/proposals.store";
import { toastsStore } from "../stores/toasts.store";

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

  const proposals: ProposalInfo[] = await findProposals({
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
  const proposals: ProposalInfo[] = await findProposals({
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

const findProposals = async ({
  beforeProposal,
  identity,
}: {
  beforeProposal: ProposalId | undefined;
  identity: Identity | null | undefined;
}): Promise<ProposalInfo[]> => {
  // TODO: https://dfinity.atlassian.net/browse/L2-346
  if (!identity) {
    throw new Error(get(i18n).error.missing_identity);
  }

  const filters: ProposalsFiltersStore = get(proposalsFiltersStore);

  return queryProposals({ beforeProposal, identity, filters });
};

/**
 * Get from store or query a proposal and apply the result to the callback (`setProposal`).
 * The function propagate error to the toast and call an optional callback in case of error.
 */
export const loadProposal = async ({
  proposalId,
  identity,
  setProposal,
  handleError,
}: {
  proposalId: ProposalId;
  identity: Identity | undefined | null;
  setProposal: (proposal: ProposalInfo) => void;
  handleError?: () => void;
}): Promise<void> => {
  const catchError = (error: unknown) => {
    console.error(error);

    toastsStore.show({
      labelKey: "error.proposal_not_found",
      level: "error",
      detail: `id: "${proposalId}"`,
    });

    handleError?.();
  };

  try {
    const proposal: ProposalInfo | undefined = await getProposal({
      proposalId,
      identity,
    });

    if (!proposal) {
      catchError(new Error("Proposal not found"));
      return;
    }

    setProposal(proposal);
  } catch (error: unknown) {
    catchError(error);
  }
};

/**
 * Return single proposal from proposalsStore or fetch it (in case of page reload or direct navigation to proposal-detail page)
 */
const getProposal = async ({
  proposalId,
  identity,
}: {
  proposalId: ProposalId;
  identity: Identity | null | undefined;
}): Promise<ProposalInfo | undefined> => {
  // TODO: https://dfinity.atlassian.net/browse/L2-346
  if (!identity) {
    throw new Error(get(i18n).error.missing_identity);
  }

  const proposal = get(proposalsStore).find(({ id }) => id === proposalId);
  return proposal || queryProposal({ proposalId, identity });
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
  neuronIds: NeuronId[];
  proposalId: ProposalId;
  vote: Vote;
  identity: Identity | null | undefined;
}): Promise<Array<GovernanceError | undefined>> => {
  if (!identity) {
    throw new Error(get(i18n).error.missing_identity);
  }

  // TODO: switch to Promise.allSettled -- https://dfinity.atlassian.net/browse/L2-369
  return Promise.all(
    neuronIds.map((neuronId: NeuronId) =>
      registerVote({
        neuronId,
        vote,
        proposalId,
        identity,
      })
    )
  );
};
