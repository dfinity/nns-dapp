import type { Identity } from "@dfinity/agent";
import {
  Topic,
  Vote,
  type NeuronId,
  type ProposalId,
  type ProposalInfo,
} from "@dfinity/nns";
import { assertNonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import {
  queryProposal,
  queryProposalPayload,
  queryProposals,
  registerVote,
} from "../api/proposals.api";
import {
  ProposalPayloadNotFoundError,
  ProposalPayloadTooLargeError,
} from "../canisters/nns-dapp/nns-dapp.errors";
import { DEFAULT_LIST_PAGINATION_LIMIT } from "../constants/constants";
import { AppPath } from "../constants/routes.constants";
import { i18n } from "../stores/i18n";
import { definedNeuronsStore, neuronsStore } from "../stores/neurons.store";
import {
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
  type ProposalsFiltersStore,
} from "../stores/proposals.store";
import { toastsStore } from "../stores/toasts.store";
import {
  voteInProgressStore,
  type VoteInProgress,
} from "../stores/voting.store";
import { getLastPathDetailId, isRoutePath } from "../utils/app-path.utils";
import { hashCode, logWithTimestamp } from "../utils/dev.utils";
import { errorToString } from "../utils/error.utils";
import { updateNeuronsVote } from "../utils/neuron.utils";
import {
  excludeProposals,
  proposalsHaveSameIds,
  registerVoteErrorDetails,
  updateProposalVote,
} from "../utils/proposals.utils";
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

export const listProposals = async ({
  loadFinished,
}: {
  loadFinished: (params: {
    paginationOver: boolean;
    certified: boolean;
  }) => void;
}): Promise<void> => {
  return findProposals({
    beforeProposal: undefined,
    onLoad: ({ response: proposals, certified }) => {
      proposalsStore.setProposals({ proposals, certified });
      loadFinished({
        paginationOver: proposals.length < DEFAULT_LIST_PAGINATION_LIMIT,
        certified,
      });
    },
    onError: handleFindProposalsError,
  });
};

/**
 * List the nex proposals in a paginated way.
 * @param {beforeProposal: ProposalId | undefined; loadFinished: (paginationOver: boolean) => void;} params
 * @param {ProposalId | undefined} params.beforeProposal Pagination starting proposal. Undefined for first results
 * @param {(paginationOver: boolean) => void;} params.loadFinished Triggered when the loading is over. `paginationOver` equals `true` if all pages of the list have been queried.
 */
export const listNextProposals = async ({
  beforeProposal,
  loadFinished,
}: {
  beforeProposal: ProposalId | undefined;
  loadFinished: (params: {
    paginationOver: boolean;
    certified: boolean;
  }) => void;
}): Promise<void> =>
  findProposals({
    beforeProposal,
    onLoad: ({ response: proposals, certified }) => {
      proposalsStore.pushProposals({ proposals, certified });
      loadFinished({
        paginationOver: proposals.length < DEFAULT_LIST_PAGINATION_LIMIT,
        certified,
      });
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

// TODO L2-751: switch to real data
export const loadProposalsByTopic = async ({
  topic,
  certified,
  identity,
}: {
  topic: Topic;
  certified: boolean;
  identity: Identity;
}): Promise<ProposalInfo[]> => {
  const filters: ProposalsFiltersStore = {
    ...get(proposalsFiltersStore),
    topics: [topic],
    rewards: [],
    status: [],
    excludeVotedProposals: false,
    lastAppliedFilter: undefined,
  };

  return queryProposals({
    beforeProposal: undefined,
    identity,
    filters,
    certified,
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
 * Loads proposal payload in proposalPayloadsStore.
 * Updates the proposalPayloadsStore with:
 * - `undefined` - loading
 * - `null` - erroneous
 * - otherwise data `object`
 */
export const loadProposalPayload = async ({
  proposalId,
}: {
  proposalId: ProposalId;
}): Promise<void> => {
  const identity: Identity = await getIdentity();

  try {
    proposalPayloadsStore.setPayload({ proposalId, payload: undefined });
    const payload = await queryProposalPayload({ proposalId, identity });
    proposalPayloadsStore.setPayload({ proposalId, payload });
  } catch (err) {
    console.error(err);

    if (err instanceof ProposalPayloadTooLargeError) {
      proposalPayloadsStore.setPayload({
        proposalId,
        payload: { error: "Payload too large" },
      });

      return;
    }
    if (err instanceof ProposalPayloadNotFoundError) {
      toastsStore.error({
        labelKey: "error.proposal_payload_not_found",
        substitutions: {
          $proposal_id: proposalId.toString(),
        },
      });

      // set 'null' avoid refetching of not existing data
      proposalPayloadsStore.setPayload({ proposalId, payload: null });

      return;
    }

    toastsStore.error({
      labelKey: "error.proposal_payload",
      err,
    });
  }
};

export const routePathProposalId = (
  path: string
): { proposalId: ProposalId | undefined } | undefined => {
  if (!isRoutePath({ path: AppPath.ProposalDetail, routePath: path })) {
    return undefined;
  }

  const proposalId: ProposalId | undefined = getLastPathDetailId(path);
  return { proposalId };
};

/**
 * Makes multiple registerVote calls (1 per neuronId).
 *
 * In order to improve UX optimistic UI update is used: after every successful neuron vote registration (`registerVote`) we mock the data (both proposal and voted neuron) and update the stores with optimistic values.
 */
export const registerVotes = async ({
  neuronIds,
  proposalInfo,
  vote,
  reloadProposalCallback,
}: {
  neuronIds: NeuronId[];
  proposalInfo: ProposalInfo;
  vote: Vote;
  reloadProposalCallback: (proposalInfo: ProposalInfo) => void;
}): Promise<void> => {
  const identity: Identity = await getIdentity();
  const proposalId = proposalInfo.id as bigint;
  const $definedNeuronsStore = get(definedNeuronsStore);
  const voteInProgress: VoteInProgress = {
    neuronIds,
    proposalId,
    successfullyVotedNeuronIds: [],
    vote,
  };

  voteInProgressStore.add(voteInProgress);

  let votingProposal: ProposalInfo = { ...proposalInfo };

  const registerVoteCallback = (neuronId: NeuronId) => {
    const originalNeuron = $definedNeuronsStore.find(
      ({ neuronId: id }) => id === neuronId
    );

    // TODO: remove after live testing. In theory it should be always defined here.
    assertNonNullish(originalNeuron, `Neuron ${neuronId} not defined`);

    voteInProgressStore.addSuccessfullyVotedNeuronId({
      proposalId,
      neuronId,
    });

    // Mocking the data and update the stores because with proceed with optimistic values
    const votingNeuron = updateNeuronsVote({
      neuron: originalNeuron,
      vote,
      proposalId,
    });
    // update proposal vote state
    votingProposal = updateProposalVote({
      proposalInfo: votingProposal,
      neuron: votingNeuron,
      vote,
    });

    neuronsStore.replaceNeurons([votingNeuron]);
    proposalsStore.replaceProposals([votingProposal]);
    // update context store
    reloadProposalCallback(votingProposal);
  };

  // display "voting in progress" message
  const $i18n = get(i18n);
  const toastMessage = toastsStore.show({
    labelKey:
      vote === Vote.Yes
        ? "proposal_detail__vote.vote_adopt_in_progress"
        : "proposal_detail__vote.vote_reject_in_progress",
    level: "info",
    spinner: true,
    substitutions: {
      $proposalId: `${proposalId}`,
      $topic: $i18n.topics[Topic[proposalInfo.topic]],
    },
  });

  try {
    logWithTimestamp(`Registering [${neuronIds.map(hashCode)}] votes call...`);

    await requestRegisterVotes({
      neuronIds,
      proposalId,
      identity,
      vote,
      topic: proposalInfo.topic,
      registerVoteCallback,
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
  // TODO(create a Jira task): be sure that some previously called proposal fetch update wouldn't ruin the faked data (probably timestamp based)

  // trigger refetching the data
  const reloadListNeurons = async () =>
    // store update is done by `listNeurons` function
    listNeurons({
      strategy: "update",
    });

  const reloadProposal = async () =>
    loadProposal({
      proposalId,
      setProposal: (proposalInfo: ProposalInfo) => {
        // update context store
        reloadProposalCallback(proposalInfo);
        // update proposal list with voted proposal to make "hide open" filter work (because of the changes in ballots)
        proposalsStore.replaceProposals([proposalInfo]);
      },
      // it will take longer but the query could contain not updated data (e.g. latestTally, votingPower on testnet)
      strategy: "update",
    });

  Promise.all([reloadListNeurons(), reloadProposal()]).finally(() => {
    // remove in progress state update call
    voteInProgressStore.remove(voteInProgress.proposalId);
    toastsStore.hide(toastMessage);
  });
};

export const requestRegisterVotes = async ({
  neuronIds,
  proposalId,
  identity,
  vote,
  topic,
  registerVoteCallback,
}: {
  neuronIds: bigint[];
  proposalId: ProposalId;
  identity: Identity;
  vote: Vote;
  topic: Topic;
  registerVoteCallback: (neuronId: NeuronId) => void;
}): Promise<void> => {
  const requests = neuronIds.map(
    (neuronId: NeuronId): Promise<void> =>
      registerVote({
        neuronId,
        vote,
        proposalId,
        identity,
      })
        // call it only after successful registration
        .then(() => registerVoteCallback(neuronId))
  );

  const responses = await Promise.allSettled(requests);
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

  if (rejectedResponses.length > 0) {
    const details: string[] = registerVoteErrorDetails({
      responses,
      neuronIds,
    });
    const $i18n = get(i18n);

    console.error("vote", rejectedResponses);

    toastsStore.show({
      labelKey: "error.register_vote",
      level: "error",
      substitutions: {
        $proposalId: `${proposalId}`,
        $topic: $i18n.topics[Topic[topic]],
      },
      detail: details.join(", "),
    });
  }
};
