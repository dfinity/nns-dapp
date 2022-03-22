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
import { busyStore } from "../stores/busy.store";
import { i18n } from "../stores/i18n";
import type { ProposalsFiltersStore } from "../stores/proposals.store";
import {
  proposalsFiltersStore,
  proposalsStore,
} from "../stores/proposals.store";
import { toastsStore } from "../stores/toasts.store";
import { getLastPathDetailId } from "../utils/app-path.utils";
import { isNode } from "../utils/dev.utils";
import { errorToString } from "../utils/error.utils";
import { stringifyJson, uniqueObjects } from "../utils/utils";
import { listNeurons } from "./neurons.services";

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

  return await queryProposals({
    beforeProposal,
    identity,
    filters,
    certified: false,
  });
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

  return queryProposal({ proposalId, identity, certified: false });
};

export const getProposalId = (path: string): ProposalId | undefined =>
  getLastPathDetailId(path);

/**
 * Makes multiple registerVote calls (1 per neuronId).
 * @returns List of errors (order is preserved)
 */
export const registerVotes = async ({
  neuronIds,
  proposalId,
  vote,
  identity,
}: {
  neuronIds: NeuronId[];
  proposalId: ProposalId;
  vote: Vote;
  identity: Identity | null | undefined;
}): Promise<void> => {
  if (!identity) {
    throw new Error(get(i18n).error.missing_identity);
  }

  busyStore.start("vote");

  try {
    await requestRegisterVotes({
      neuronIds,
      proposalId,
      vote,
      identity,
    });
  } catch (error) {
    // TODO: replace w/ console.error mock
    if (!isNode()) {
      // preserve in unit-test
      console.error("vote unknown:", error);
    }
    toastsStore.show({
      labelKey: "error.register_vote_unknown",
      level: "error",
      detail: errorToString(error),
    });
  }

  await listNeurons({ identity });

  busyStore.stop("vote");
};

const requestRegisterVotes = async ({
  neuronIds,
  proposalId,
  vote,
  identity,
}: {
  neuronIds: bigint[];
  proposalId: ProposalId;
  vote: Vote;
  identity: Identity;
}): Promise<void> => {
  // TODO: switch to Promise.allSettled -- https://dfinity.atlassian.net/browse/L2-369
  const responses: Array<GovernanceError | undefined> = await Promise.all(
    neuronIds.map((neuronId: NeuronId) =>
      registerVote({
        neuronId,
        vote,
        proposalId,
        identity,
      })
    )
  );
  const errors = responses.filter(Boolean);
  // collect unique error messages
  const errorDetails: string = uniqueObjects(errors)
    .map((error) =>
      typeof error?.errorMessage === "string" && error.errorMessage.length > 0
        ? stringifyJson(error?.errorMessage, { indentation: 2 })
        : ""
    )
    .filter(Boolean)
    .join("\n");

  if (errors.length > 0) {
    // TODO: replace w/ console.error mock
    if (!isNode()) {
      // avoid in unit-test
      console.error("vote:", errorDetails);
    }
    toastsStore.show({
      labelKey: "error.register_vote",
      level: "error",
      detail: errorDetails.length > 0 ? `\n${errorDetails}` : undefined,
    });
  }
};
