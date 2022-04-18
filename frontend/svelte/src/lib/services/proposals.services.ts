import type { Identity } from "@dfinity/agent";
import type { NeuronId, ProposalId, ProposalInfo, Vote } from "@dfinity/nns";
import { get } from "svelte/store";
import {
  queryProposal,
  queryProposals,
  registerVote,
} from "../api/proposals.api";
import {
  startBusy,
  stopBusy,
  type BusyStateInitiator,
} from "../stores/busy.store";
import { i18n } from "../stores/i18n";
import type { ProposalsFiltersStore } from "../stores/proposals.store";
import {
  proposalInfoStore,
  proposalsFiltersStore,
  proposalsStore,
} from "../stores/proposals.store";
import { toastsStore } from "../stores/toasts.store";
import { getLastPathDetailId } from "../utils/app-path.utils";
import { errorToString } from "../utils/error.utils";
import { replacePlaceholders } from "../utils/i18n.utils";
import {
  excludeProposals,
  proposalsHaveSameIds,
} from "../utils/proposals.utils";
import { isDefined } from "../utils/utils";
import { getIdentity } from "./auth.services";
import { listNeurons } from "./neurons.services";
import {
  queryAndUpdate,
  type QueryAndUpdateOnError,
  type QueryAndUpdateOnResponse,
} from "./utils.services";

const handleFindProposalsError = ({ error, certified }) => {
  console.error(error);

  // Explicitly handle only UPDATE errors
  if (certified === true) {
    proposalsStore.setProposals({ proposals: [], certified });

    toastsStore.show({
      labelKey: "error.list_proposals",
      level: "error",
      detail: errorToString(error),
    });
  }
};

export const listProposals = async (): Promise<void> => {
  return findProposals({
    beforeProposal: undefined,
    onLoad: ({ response: proposals, certified }) =>
      proposalsStore.setProposals({ proposals, certified }),
    onError: handleFindProposalsError,
  });
};

export const listNextProposals = async ({
  beforeProposal,
}: {
  beforeProposal: ProposalId | undefined;
}): Promise<void> =>
  findProposals({
    beforeProposal,
    onLoad: ({ response: proposals, certified }) => {
      if (proposals.length === 0) {
        // There is no more proposals to fetch for the current filters.
        // We do not update the store with empty ([]) otherwise it will re-render the component and therefore triggers the Infinite Scrolling again.
        return;
      }
      proposalsStore.pushProposals({ proposals, certified });
    },
    onError: handleFindProposalsError,
  });

const findProposals = async ({
  beforeProposal,
  onLoad,
  onError,
}: {
  beforeProposal: ProposalId | undefined;
  onLoad: QueryAndUpdateOnResponse<ProposalInfo[]>;
  onError: QueryAndUpdateOnError<unknown>;
}): Promise<void> => {
  const identity: Identity = await getIdentity();
  const filters: ProposalsFiltersStore = get(proposalsFiltersStore);

  const { topics, rewards, status } = filters;

  // The governance canister consider empty filters and an "any" query. Flutter on the contrary considers empty as empty.
  // That's why we implement the same behavior and do not render any proposals if one of the filter is empty.
  // This is covered by our utils "hideProposal" but to avoid glitch, like displaying a spinner appearing and disappearing for a while, we "just" do not query the canister and empty the store if one of the filter is empty.
  if (topics.length === 0 || rewards.length === 0 || status.length === 0) {
    proposalsStore.setProposals({ proposals: [], certified: undefined });
    return;
  }

  const validateResponses = (
    trustedProposals: ProposalInfo[],
    untrustedProposals: ProposalInfo[]
  ) => {
    if (
      proposalsHaveSameIds({
        proposalsA: untrustedProposals,
        proposalsB: trustedProposals,
      })
    ) {
      return;
    }

    console.error("query != update", untrustedProposals, trustedProposals);

    // Remove proven untrusted proposals (in query but not in update)
    const proposalsToRemove = excludeProposals({
      proposals: untrustedProposals,
      exclusion: trustedProposals,
    });
    if (proposalsToRemove.length > 0) {
      proposalsStore.removeProposals(proposalsToRemove);
    }
  };
  let uncertifiedProposals: ProposalInfo[] | undefined;

  return queryAndUpdate<ProposalInfo[], unknown>({
    request: ({ certified }) =>
      queryProposals({ beforeProposal, identity, filters, certified }),
    onLoad: ({ response: proposals, certified }) => {
      if (certified === false) {
        uncertifiedProposals = proposals;
        onLoad({ response: proposals, certified });
        return;
      }

      if (uncertifiedProposals) {
        validateResponses(proposals, uncertifiedProposals);
      }

      onLoad({ response: proposals, certified });
    },
    onError,
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
  silentErrorMessages,
  callback,
}: {
  proposalId: ProposalId;
  setProposal: (proposal: ProposalInfo) => void;
  handleError?: () => void;
  silentErrorMessages?: boolean;
  callback?: (certified: boolean) => void;
}): Promise<void> => {
  const catchError = (error: unknown) => {
    console.error(error);

    if (silentErrorMessages !== true) {
      toastsStore.show({
        labelKey: "error.proposal_not_found",
        level: "error",
        detail: `id: "${proposalId}"`,
      });
    }

    handleError?.();
  };

  try {
    return await getProposal({
      proposalId,
      onLoad: ({ response: proposal, certified }) => {
        if (!proposal) {
          catchError(new Error("Proposal not found"));
          return;
        }

        setProposal(proposal);

        callback?.(certified);
      },
      onError: catchError,
    });
  } catch (error: unknown) {
    catchError(error);
  }
};

/**
 * Return single proposal from proposalsStore or fetch it (in case of page reload or direct navigation to proposal-detail page)
 */
const getProposal = async ({
  proposalId,
  onLoad,
  onError,
}: {
  proposalId: ProposalId;
  onLoad: QueryAndUpdateOnResponse<ProposalInfo | undefined>;
  onError: QueryAndUpdateOnError<unknown>;
}): Promise<void> => {
  const identity: Identity = await getIdentity();

  return queryAndUpdate<ProposalInfo | undefined, unknown>({
    request: ({ certified }) =>
      queryProposal({ proposalId, identity, certified }),
    onLoad,
    onError,
  });
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
  startBusy("vote");

  const identity: Identity = await getIdentity();

  try {
    await requestRegisterVotes({
      neuronIds,
      proposalId,
      identity,
      vote,
    });
  } catch (error: unknown) {
    console.error("vote unknown:", error);

    toastsStore.show({
      labelKey: "error.register_vote_unknown",
      level: "error",
      detail: errorToString(error),
    });
  }

  const stopBusySpinner = ({
    certified,
    initiator,
  }: {
    certified: boolean;
    initiator: BusyStateInitiator;
  }) => {
    if (!certified) {
      return;
    }

    stopBusy(initiator);
  };

  const reloadListNeurons = async () => {
    startBusy("reload-neurons");

    try {
      await listNeurons({
        callback: (certified: boolean) =>
          stopBusySpinner({ certified, initiator: "reload-neurons" }),
      });
    } catch (err) {
      console.error(err);
      toastsStore.error({
        labelKey: "error.list_proposals",
        err,
      });

      stopBusy("reload-neurons");
    }
  };

  const reloadProposal = async () => {
    startBusy("reload-proposal");

    await loadProposal({
      proposalId,
      setProposal: (proposalInfo: ProposalInfo) => {
        proposalInfoStore.set(proposalInfo);
        // update proposal list with voted proposal to make "hide open" filter work (because of the changes in ballots)
        proposalsStore.replaceProposals([proposalInfo]);
      },
      callback: (certified: boolean) =>
        stopBusySpinner({ certified, initiator: "reload-proposal" }),
      handleError: () => stopBusy("reload-proposal"),
    });
  };

  await Promise.all([reloadListNeurons(), reloadProposal()]);

  stopBusy("vote");
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
  const errorDetail = (
    neuronId: NeuronId,
    result: PromiseSettledResult<void>
  ): string | undefined => {
    if (result.status === "rejected" && result.reason instanceof Error) {
      const reason = errorToString(result.reason);
      // detail text
      return replacePlaceholders(get(i18n).error.register_vote_neuron, {
        $neuronId: neuronId.toString(),
        $reason:
          reason === undefined || reason?.length === 0
            ? get(i18n).error.fail
            : reason,
      });
    }
    return undefined;
  };
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
  const details: string[] = responses
    .map((response, i) => errorDetail(neuronIds[i], response))
    .filter(isDefined);

  if (details.length > 0) {
    console.error("vote", details);

    toastsStore.show({
      labelKey: "error.register_vote",
      level: "error",
      detail: details.join(", "),
    });
  }
};
