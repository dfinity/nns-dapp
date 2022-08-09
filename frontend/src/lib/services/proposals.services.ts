import type { Identity } from "@dfinity/agent";
import {
  Vote,
  type NeuronId,
  type ProposalId,
  type ProposalInfo,
  type Topic,
} from "@dfinity/nns";
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
import { assertNonNullish } from "../utils/asserts.utils";
import { hashCode, logWithTimestamp } from "../utils/dev.utils";
import { errorToString } from "../utils/error.utils";
import { replacePlaceholders } from "../utils/i18n.utils";
import { updateNeuronsVote } from "../utils/neuron.utils";
import {
  excludeProposals,
  proposalsHaveSameIds,
  updateProposalVote,
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
 * @returns List of errors (order is preserved)
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
  const voteInProgress: VoteInProgress = {
    neuronIds,
    proposalId,
    successfullyVotedNeuronIds: [],
    vote,
  };
  const $definedNeuronsStore = get(definedNeuronsStore);

  voteInProgressStore.add(voteInProgress);

  let votingProposal: ProposalInfo = { ...proposalInfo };

  const $i18n = get(i18n);
  const toastMessage = toastsStore.show({
    labelKey: "proposal_detail__vote.voting_in_progress_message",
    level: "running",
    substitutions: {
      $vote: vote === Vote.YES ? $i18n.core.yes : $i18n.core.no,
      $proposalTitle: proposalInfo.proposal?.title ?? "",
      $proposalId: `${proposalId}`,
    },
  });
  const registerVoteCallback = (neuronId: NeuronId) => {
    const originalNeuron = $definedNeuronsStore.find(
      ({ neuronId: id }) => id === neuronId
    );

    assertNonNullish(originalNeuron, `Neuron ${neuronId} not defined`);

    voteInProgressStore.addSuccessfullyVotedNeuronIds({
      proposalId,
      successfullyVotedNeuronIds: [neuronId],
    });

    // pretend voting
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

  try {
    logWithTimestamp(`Registering [${neuronIds.map(hashCode)}] votes call...`);
    await requestRegisterVotes({
      neuronIds,
      proposalId,
      identity,
      vote,
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
    // remove in progress state only after successful update call
    voteInProgressStore.remove(voteInProgress.proposalId);
    toastsStore.hide(toastMessage);
  });
};

const requestRegisterVotes = async ({
  neuronIds,
  proposalId,
  identity,
  vote,
  registerVoteCallback,
}: {
  neuronIds: bigint[];
  proposalId: ProposalId;
  identity: Identity;
  vote: Vote;
  registerVoteCallback: (neuronId: NeuronId) => void;
}): Promise<void> => {
  const errorDetail = (
    neuronId: NeuronId,
    result: PromiseSettledResult<void>
  ): string | undefined => {
    if (result.status === "rejected") {
      const reason =
        result.reason instanceof Error
          ? errorToString(result.reason)
          : undefined;
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
        }).then(() => registerVoteCallback(neuronId))
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

  if (rejectedResponses.length > 0) {
    const details: string[] = responses
      .map((response, i) => errorDetail(neuronIds[i], response))
      .filter(isDefined);
    console.error("vote", rejectedResponses);

    toastsStore.show({
      labelKey: "error.register_vote",
      level: "error",
      substitutions: {
        $proposalId: `${proposalId}`,
        $neuronIds: details.join(", "),
      },
    });
  }
};
