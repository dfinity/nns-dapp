import type { Identity } from "@dfinity/agent";
import type { NeuronId, ProposalId, ProposalInfo, Vote } from "@dfinity/nns";
import { get } from "svelte/store";
import {
  queryProposal,
  queryProposalPayload,
  queryProposals,
  registerVote,
} from "../api/proposals.api";
import { ProposalPayloadNotFoundError } from "../canisters/nns-dapp/nns-dapp.errors";
import {
  startBusy,
  stopBusy,
  type BusyStateInitiatorType,
} from "../stores/busy.store";
import { i18n } from "../stores/i18n";
import {
  proposalInfoStore,
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
  type ProposalsFiltersStore,
} from "../stores/proposals.store";
import { toastsStore } from "../stores/toasts.store";
import { getLastPathDetailId } from "../utils/app-path.utils";
import { hashCode, logWithTimestamp } from "../utils/dev.utils";
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
  type QueryAndUpdateStrategy,
} from "./utils.services";

const handleFindProposalsError = ({ error: err, certified }) => {
  console.error(err);

  // Explicitly handle only UPDATE errors
  if (certified === true) {
    proposalsStore.setProposals({ proposals: [], certified });

    toastsStore.error({
      labelKey: "error.list_proposals",
      err,
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
    logMessage: `Syncing proposals ${
      beforeProposal === undefined ? "" : `from: ${hashCode(beforeProposal)}`
    }`,
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
  callback,
  silentErrorMessages,
  silentUpdateErrorMessages,
  strategy = "query_and_update",
}: {
  proposalId: ProposalId;
  setProposal: (proposal: ProposalInfo) => void;
  handleError?: (certified: boolean) => void;
  callback?: (certified: boolean) => void;
  silentErrorMessages?: boolean;
  silentUpdateErrorMessages?: boolean;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  const catchError: QueryAndUpdateOnError<Error | unknown> = (
    erroneusResponse
  ) => {
    console.error(erroneusResponse);

    const skipUpdateErrorHandling =
      silentUpdateErrorMessages === true && erroneusResponse.certified === true;

    if (silentErrorMessages !== true && !skipUpdateErrorHandling) {
      const details = errorToString(erroneusResponse?.error);
      toastsStore.show({
        labelKey: "error.proposal_not_found",
        level: "error",
        detail: `id: "${proposalId}"${
          details === undefined ? "" : `. ${details}`
        }`,
      });
    }

    handleError?.(erroneusResponse.certified);
  };

  try {
    return await getProposal({
      proposalId,
      onLoad: ({ response: proposal, certified }) => {
        if (!proposal) {
          catchError({ certified, error: undefined });
          return;
        }

        setProposal(proposal);

        callback?.(certified);
      },
      onError: catchError,
      strategy,
    });
  } catch (error: unknown) {
    catchError({ certified: true, error });
  }
};

/**
 * Return single proposal from proposalsStore or fetch it (in case of page reload or direct navigation to proposal-detail page)
 */
const getProposal = async ({
  proposalId,
  onLoad,
  onError,
  strategy,
}: {
  proposalId: ProposalId;
  onLoad: QueryAndUpdateOnResponse<ProposalInfo | undefined>;
  onError: QueryAndUpdateOnError<Error | undefined>;
  strategy: QueryAndUpdateStrategy;
}): Promise<void> => {
  const identity: Identity = await getIdentity();

  return queryAndUpdate<ProposalInfo | undefined, unknown>({
    request: ({ certified }) =>
      queryProposal({ proposalId, identity, certified }),
    onLoad,
    onError,
    strategy,
    logMessage: `Syncing Proposal ${hashCode(proposalId)}`,
  });
};

/**
 * Loads proposal payload in proposalPayloadsStore
 */
export const loadProposalPayload = async ({
  proposalId,
}: {
  proposalId: ProposalId;
}): Promise<void> => {
  const identity: Identity = await getIdentity();

  try {
    const payload = await queryProposalPayload({ proposalId, identity });
    proposalPayloadsStore.setPayload({ proposalId, payload });
  } catch (err) {
    console.error(err);

    if (err instanceof ProposalPayloadNotFoundError) {
      toastsStore.error({
        labelKey: "error.proposal_payload_not_found",
        substitutions: {
          $proposal_id: proposalId.toString(),
        },
      });
      return;
    }

    toastsStore.error({
      labelKey: "error.proposal_payload",
      err,
    });
  }
};

export const routePathProposalId = (path: string): ProposalId | undefined =>
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
  startBusy({ initiator: "vote" });

  const identity: Identity = await getIdentity();

  try {
    logWithTimestamp(`Registering [${neuronIds.map(hashCode)}] votes call...`);
    await requestRegisterVotes({
      neuronIds,
      proposalId,
      identity,
      vote,
    });
    logWithTimestamp(
      `Registering [${neuronIds.map(hashCode)}] votes complete.`
    );
  } catch (err: unknown) {
    console.error("vote unknown:", err);

    toastsStore.error({
      labelKey: "error.register_vote_unknown",
      err,
    });
  }

  const stopBusySpinner = ({
    certified,
    initiator,
  }: {
    certified: boolean;
    initiator: BusyStateInitiatorType;
  }) => {
    if (!certified) {
      return;
    }

    stopBusy(initiator);
  };

  const reloadListNeurons = async () => {
    startBusy({ initiator: "reload-neurons" });

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
    startBusy({ initiator: "reload-proposal" });

    await loadProposal({
      proposalId,
      setProposal: (proposalInfo: ProposalInfo) => {
        proposalInfoStore.set(proposalInfo);
        // update proposal list with voted proposal to make "hide open" filter work (because of the changes in ballots)
        proposalsStore.replaceProposals([proposalInfo]);
      },
      // it will take longer but the query could contain not updated data (e.g. latestTally, votingPower on testnet)
      strategy: "update",
      callback: (certified: boolean) =>
        stopBusySpinner({ certified, initiator: "reload-proposal" }),
      handleError: () => stopBusy("reload-proposal"),
      silentUpdateErrorMessages: true,
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

  const rejectedResponses = responses.filter(
    (response: PromiseSettledResult<void>) => {
      const { status } = response;

      // We ignore the error "Neuron already voted on proposal." - i.e. we consider it as a valid response
      // 1. the error truly means the neuron has already voted.
      // 2. if user has for example two neurons with one neuron (B) following another neuron (A). Then if user select both A and B to cast a vote, A will first vote for itself and then vote for the followee B. Then Promise.allSettled above process next neuron B and try to vote again but this vote won't succeed, because it has already been registered by A.
      // TODO(L2-465): discuss with Governance team to either turn the error into a valid response (or warning) with comment or to throw a unique identifier for this particular error.
      const hasAlreadyVoted: boolean =
        "reason" in response &&
        response.reason?.detail?.error_message ===
          "Neuron already voted on proposal.";

      return status === "rejected" && !hasAlreadyVoted;
    }
  );

  const details: string[] = responses
    .map((response, i) => errorDetail(neuronIds[i], response))
    .filter(isDefined);
  if (rejectedResponses.length > 0) {
    console.error("vote", rejectedResponses);

    toastsStore.show({
      labelKey: "error.register_vote",
      level: "error",
      detail: details.join(", "),
    });
  }
};
