import type { Identity } from "@dfinity/agent";
import type { NeuronId, ProposalId, ProposalInfo, Vote } from "@dfinity/nns";
import { GovernanceError } from "@dfinity/nns";
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
import { isNode } from "../utils/dev.utils";
import { errorToString } from "../utils/error.utils";
import { stringifyJson, uniqueObjects } from "../utils/utils";
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

  await listNeurons();

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
  const register = async (
    neuronId: NeuronId
  ): Promise<GovernanceError | undefined> => {
    try {
      await registerVote({
        neuronId,
        vote,
        proposalId,
        identity,
      });

      return undefined;
    } catch (error: GovernanceError | unknown) {
      // We catch the error because we want to display only the distinct GovernanceError
      if (error instanceof GovernanceError) {
        return error;
      }

      // We throw anyway unexpected errors
      throw error;
    }
  };

  // TODO: switch to Promise.allSettled -- https://dfinity.atlassian.net/browse/L2-369
  const responses: Array<GovernanceError | undefined> = await Promise.all(
    neuronIds.map(register)
  );
  const errors = responses.filter(Boolean);
  // collect unique error messages
  const errorDetails: string = uniqueObjects(errors)
    .map(({ detail }: GovernanceError) =>
      stringifyJson(detail.error_message, { indentation: 2 })
    )
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
