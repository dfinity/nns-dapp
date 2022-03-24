import type { Identity } from "@dfinity/agent";
import type { NeuronId, ProposalId, ProposalInfo, Vote } from "@dfinity/nns";
import { get } from "svelte/store";
import {
  queryProposal,
  queryProposals,
  registerVote,
} from "../api/proposals.api";
import { busyStore } from "../stores/busy.store";
import type { ProposalsFiltersStore } from "../stores/proposals.store";
import {
  proposalsFiltersStore,
  proposalsStore,
} from "../stores/proposals.store";
import { toastsStore } from "../stores/toasts.store";
import { getLastPathDetailId } from "../utils/app-path.utils";
import { errorToString } from "../utils/error.utils";
import { replacePlaceholders } from "../utils/i18n.utils";
import { getIdentity } from "./auth.services";
import { listNeurons } from "./neurons.services";

export const listProposals = async ({
  clearBeforeQuery = false,
}: {
  clearBeforeQuery?: boolean;
}) => {
  if (clearBeforeQuery) {
    proposalsStore.setProposals([]);
  }

  const proposals: ProposalInfo[] = await findProposals({
    beforeProposal: undefined,
  });

  proposalsStore.setProposals(proposals);
};

export const listNextProposals = async ({
  beforeProposal,
}: {
  beforeProposal: ProposalId | undefined;
}) => {
  const proposals: ProposalInfo[] = await findProposals({
    beforeProposal,
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
}: {
  beforeProposal: ProposalId | undefined;
}): Promise<ProposalInfo[]> => {
  const filters: ProposalsFiltersStore = get(proposalsFiltersStore);

  const identity: Identity = await getIdentity();

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
  setProposal,
  handleError,
}: {
  proposalId: ProposalId;
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
}: {
  proposalId: ProposalId;
}): Promise<ProposalInfo | undefined> => {
  const identity: Identity = await getIdentity();

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
}: {
  neuronIds: NeuronId[];
  proposalId: ProposalId;
  vote: Vote;
}): Promise<void> => {
  busyStore.start("vote");

  const identity: Identity = await getIdentity();

  try {
    await requestRegisterVotes({
      neuronIds,
      proposalId,
      identity,
      vote,
    });
  } catch (error) {
    console.error("vote unknown:", error);

    toastsStore.show({
      labelKey: "error.register_vote_unknown",
      level: "error",
      detail: errorToString(error),
    });
  }

  try {
    await listNeurons();
  } catch (err) {
    console.error(err);
    toastsStore.error({
      labelKey: "error.list_proposals",
      err,
    });
  }

  busyStore.stop("vote");
};

const requestRegisterVotes = async ({
  neuronIds,
  proposalId,
  identity,
  vote,
}: {
  neuronIds: bigint[];
  proposalId: ProposalId;
  identity: Identity;
  vote: Vote;
}): Promise<void> => {
  const responses: Array<PromiseSettledResult<void>> = await Promise.allSettled(
    neuronIds.map(
      (neuronId: NeuronId): Promise<void> =>
        registerVote({
          neuronId,
          vote,
          proposalId,
          identity,
        })
    )
  );
  const errors: Array<{
    neuronId: bigint;
    error: Error;
  }> = responses
    // add neuronId
    .map((result, i) => ({ neuronId: neuronIds[i], result }))
    // handle only not-empty errors
    .filter(
      ({ result }) =>
        result.status === "rejected" && result.reason instanceof Error
    )
    .map(({ neuronId, result }) => ({
      neuronId,
      error: (result as PromiseRejectedResult).reason,
    }));

  if (errors.length > 0) {
    console.error("vote", errors);

    // neuronId next to the error text
    const detail: string = errors
      .map(({ neuronId, error }) => {
        const reason = errorToString(error);
        return replacePlaceholders(get(i18n).error.register_vote_neuron, {
          $neuronId: neuronId.toString(),
          $reason:
            reason === undefined || reason?.length === 0
              ? get(i18n).error.fail
              : reason,
        });
      })
      .join(", ");
    toastsStore.show({
      labelKey: "error.register_vote",
      level: "error",
      detail,
    });
  }
};
