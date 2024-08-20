import { goto } from "$app/navigation";
import { i18n } from "$lib/stores/i18n";
import type { ProposalsFiltersStore } from "$lib/stores/proposals.store";
import type { VoteRegistrationStoreEntry } from "$lib/stores/vote-registration.store";
import type {
  ProposalsNavigationId,
  UniversalProposalStatus,
  VotingNeuron,
} from "$lib/types/proposals";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import { buildProposalUrl } from "$lib/utils/navigation.utils";
import type {
  Ballot,
  ExecuteNnsFunction,
  NeuronId,
  NeuronInfo,
  Proposal,
  ProposalId,
  ProposalInfo,
  Tally,
} from "@dfinity/nns";
import {
  NnsFunction,
  ProposalRewardStatus,
  ProposalStatus,
  Topic,
  Vote,
} from "@dfinity/nns";
import type { SnsVote } from "@dfinity/sns";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { nowInSeconds } from "./date.utils";
import { errorToString } from "./error.utils";
import { replacePlaceholders } from "./i18n.utils";
import { toNnsVote } from "./sns-proposals.utils";
import { isDefined, keyOf, keyOfOptional } from "./utils";

export const lastProposalId = (
  proposalInfos: ProposalInfo[]
): ProposalId | undefined => {
  const { length, [length - 1]: last } = proposalInfos;
  return last?.id;
};

export const proposalFirstActionKey = (
  proposal: Proposal | undefined
): string | undefined => Object.keys(proposal?.action ?? {})[0];

export const proposalActionData = (proposal: Proposal): unknown | undefined => {
  const key = proposalFirstActionKey(proposal);
  if (key === undefined) {
    return {};
  }

  return (proposal.action as { [key: string]: unknown })?.[key];
};

export const getNnsFunctionKey = (
  proposal: Proposal | undefined
): string | undefined => {
  const action = proposalFirstActionKey(proposal);

  if (action !== "ExecuteNnsFunction") {
    return undefined;
  }

  // 0 equals Unspecified
  const { nnsFunctionId }: ExecuteNnsFunction = keyOfOptional({
    obj: proposal?.action,
    key: action,
  }) ?? {
    nnsFunctionId: 0,
  };

  return NnsFunction[nnsFunctionId];
};

/**
 * Hide proposal that don't match filters
 */
export const hideProposal = ({
  proposalInfo,
  filters,
}: {
  proposalInfo: ProposalInfo;
  filters: ProposalsFiltersStore;
}): boolean => !matchFilters({ proposalInfo, filters });

/**
 * Does the proposal returned by the backend really matches the filter selected by the user?
 */
const matchFilters = ({
  proposalInfo,
  filters,
}: {
  proposalInfo: ProposalInfo;
  filters: ProposalsFiltersStore;
}): boolean => {
  const { topics, status } = filters;

  const { topic: proposalTopic, status: proposalStatus } = proposalInfo;

  return (
    (topics.length === 0 || topics.includes(proposalTopic)) &&
    (status.length === 0 || status.includes(proposalStatus))
  );
};

/**
 * Do we have any proposals that match the filters to render or should we display the user that nothing was found?
 */
export const hasMatchingProposals = ({
  proposals,
  filters,
}: {
  proposals: ProposalInfo[];
  filters: ProposalsFiltersStore;
}): boolean => {
  if (proposals.length === 0) {
    return false;
  }

  return (
    proposals.find(
      (proposalInfo: ProposalInfo) => !hideProposal({ proposalInfo, filters })
    ) !== undefined
  );
};

export const getVotingBallot = ({
  neuronId,
  proposalInfo: { ballots },
}: {
  neuronId: bigint;
  proposalInfo: ProposalInfo;
}): Ballot | undefined =>
  ballots.find((ballot) => ballot.neuronId === neuronId);

// We first check the voting power of the ballot from the proposal. Which is the voting power that was used to vote.
// In the edge case that the proposal voting power is not present, then we show the neuron voting power.
export const getVotingPower = ({
  neuron: { neuronId, votingPower },
  proposal,
}: {
  neuron: NeuronInfo;
  proposal: ProposalInfo;
}): bigint =>
  getVotingBallot({
    neuronId,
    proposalInfo: proposal,
  })?.votingPower ?? votingPower;

export const selectedNeuronsVotingPower = ({
  neurons,
  selectedIds,
}: {
  neurons: VotingNeuron[];
  selectedIds: string[];
}): bigint =>
  neurons
    .filter(({ neuronIdString }) => selectedIds.includes(neuronIdString))
    .map(({ votingPower }) => votingPower)
    .reduce((sum, votingPower) => sum + votingPower, 0n);

/**
 * Generate new selected neuron id list after new neurons response w/o spoiling the previously done user selection
 */
export const preserveNeuronSelectionAfterUpdate = ({
  selectedIds,
  neurons,
  updatedNeurons,
}: {
  selectedIds: string[];
  neurons: VotingNeuron[];
  updatedNeurons: VotingNeuron[];
}): string[] => {
  const newIds = new Set(
    updatedNeurons.map(({ neuronIdString }) => neuronIdString)
  );
  const oldIds = new Set(neurons.map(({ neuronIdString }) => neuronIdString));
  const preservedSelection = selectedIds.filter((id) => newIds.has(id));
  const newNeuronsSelection = Array.from(newIds).filter(
    (id) => oldIds.has(id) === false
  );
  return [...preservedSelection, ...newNeuronsSelection];
};

export const proposalIdSet = (proposals: ProposalInfo[]): Set<ProposalId> =>
  new Set(proposals.map(({ id }) => id).filter(isDefined));

/**
 * Compares proposals by "id"
 */
export const concatenateUniqueProposals = ({
  // TODO(max): replace with unnamed parameters because it's now being used in multiple places
  oldProposals,
  newProposals,
}: {
  oldProposals: ProposalInfo[];
  newProposals: ProposalInfo[];
}): ProposalInfo[] => [
  ...oldProposals,
  ...excludeProposals({
    proposals: newProposals,
    exclusion: oldProposals,
  }),
];

/**
 * Compares proposals by "id" and replace those existing then append the remaining new proposals.
 */
export const replaceAndConcatenateProposals = ({
  oldProposals,
  newProposals,
}: {
  oldProposals: ProposalInfo[];
  newProposals: ProposalInfo[];
}): ProposalInfo[] => {
  const updatedProposals = oldProposals.map(
    (stateProposal) =>
      newProposals.find(({ id }) => stateProposal.id === id) ?? stateProposal
  );

  const newStateProposalsIds: (ProposalId | undefined)[] = updatedProposals.map(
    ({ id }) => id
  );
  const brandNewProposals: ProposalInfo[] = newProposals.filter(
    ({ id }) => !newStateProposalsIds.includes(id)
  );

  return concatenateUniqueProposals({
    oldProposals: updatedProposals,
    newProposals: brandNewProposals,
  });
};

/**
 * Compares proposals by "id"
 */
export const replaceProposals = ({
  oldProposals,
  newProposals,
}: {
  oldProposals: ProposalInfo[];
  newProposals: ProposalInfo[];
}): ProposalInfo[] =>
  oldProposals.map(
    (oldProposal) =>
      newProposals.find(({ id }) => id === oldProposal.id) ?? oldProposal
  );

/**
 * Compares 2 proposal lists by entries "id"
 */
export const proposalsHaveSameIds = ({
  proposalsA,
  proposalsB,
}: {
  proposalsA: ProposalInfo[];
  proposalsB: ProposalInfo[];
}): boolean =>
  proposalsA
    .map(({ id }) => id)
    .sort()
    .join() ===
  proposalsB
    .map(({ id }) => id)
    .sort()
    .join();

export const excludeProposals = ({
  proposals,
  exclusion,
}: {
  proposals: ProposalInfo[];
  exclusion: ProposalInfo[];
}): ProposalInfo[] => {
  const excludeIds = proposalIdSet(exclusion);
  return proposals.filter(({ id }) => !excludeIds.has(id as ProposalId));
};

export type ProposalInfoMap = {
  id: ProposalId | undefined;
  proposal: Proposal | undefined;
  proposer: NeuronId | undefined;
  title: string | undefined;
  url: string | undefined;

  created: bigint;
  decided: bigint | undefined;
  executed: bigint | undefined;
  failed: bigint | undefined;
  deadline: bigint | undefined;

  topic: string | undefined;
  topicDescription: string | undefined;
  type: string | undefined;
  typeDescription: string | undefined;
  status: ProposalStatus;
  statusString: string;
  statusDescription: string | undefined;
  rewardStatus: ProposalRewardStatus;
  rewardStatusString: string;
  rewardStatusDescription: string | undefined;
};

export const mapProposalInfo = (
  proposalInfo: ProposalInfo
): ProposalInfoMap => {
  const {
    proposal,
    proposer,
    id,
    status,
    rewardStatus,
    deadlineTimestampSeconds,
    proposalTimestampSeconds,
    decidedTimestampSeconds,
    executedTimestampSeconds,
    failedTimestampSeconds,
  } = proposalInfo;

  const {
    topics,
    topics_description,
    status_description,
    status: statusLabels,
    rewards,
    rewards_description,
  } = get(i18n);
  const deadline =
    deadlineTimestampSeconds === undefined
      ? undefined
      : deadlineTimestampSeconds - BigInt(nowInSeconds());

  const topicKey = Topic[proposalInfo?.topic];

  const statusKey = ProposalStatus[status];
  const rewardStatusKey = ProposalRewardStatus[rewardStatus];

  return {
    id,
    proposer,
    proposal,
    title: proposal?.title,
    url: proposal?.url,

    created: proposalTimestampSeconds,
    decided: decidedTimestampSeconds > 0 ? decidedTimestampSeconds : undefined,
    executed:
      executedTimestampSeconds > 0 ? executedTimestampSeconds : undefined,
    failed: failedTimestampSeconds > 0 ? failedTimestampSeconds : undefined,
    deadline,

    topic: keyOf({ obj: topics, key: topicKey }),
    topicDescription: keyOf({ obj: topics_description, key: topicKey }),
    status,
    statusString: keyOf({ obj: statusLabels, key: statusKey }),
    statusDescription: keyOf({ obj: status_description, key: statusKey }),
    rewardStatus,
    rewardStatusString: keyOf({ obj: rewards, key: rewardStatusKey }),
    rewardStatusDescription: keyOf({
      obj: rewards_description,
      key: rewardStatusKey,
    }),
    ...mapProposalType(proposal),
  };
};

/**
 * If the action is a ExecuteNnsFunction, then we map the NNS function id (its detailed label).
 * Otherwise, we map the action function itself.
 *
 * This outcome is called "the proposal type".
 */
const mapProposalType = (
  proposal: Proposal | undefined
): Pick<ProposalInfoMap, "type" | "typeDescription"> => {
  const {
    actions,
    actions_description,
    nns_functions,
    nns_functions_description,
  } = get(i18n);

  const NO_MATCH = { type: undefined, typeDescription: undefined };

  if (proposal === undefined) {
    return NO_MATCH;
  }

  const nnsFunctionKey: string | undefined = getNnsFunctionKey(proposal);

  if (nnsFunctionKey !== undefined) {
    return {
      type: keyOf({ obj: nns_functions, key: nnsFunctionKey }),
      typeDescription: keyOf({
        obj: nns_functions_description,
        key: nnsFunctionKey,
      }),
    };
  }

  const action: string | undefined = proposalFirstActionKey(proposal);

  return action !== undefined
    ? {
        type: keyOf({ obj: actions, key: action }),
        typeDescription: keyOf({ obj: actions_description, key: action }),
      }
    : NO_MATCH;
};

/**
 * A proposal can be accepted or declined if the majority votes before its duration expires but, it remains open for voting until then.
 * That is why we should not consider the status "OPEN" to present a proposal as open for voting but consider the duration.
 */
export const isProposalDeadlineInTheFuture = (
  proposalInfo: ProposalInfo
): boolean => votingPeriodEnd(proposalInfo).getTime() >= Date.now();

/**
 * Return the voting period end date of a proposal.
 * @returns {Date} The voting period end date
 */
const votingPeriodEnd = (proposalInfo: ProposalInfo): Date => {
  const { deadlineTimestampSeconds } = proposalInfo;

  // Fallback for undefined deadline_timestamp_seconds which actually should never happen.
  if (deadlineTimestampSeconds === undefined) {
    return votingPeriodEndFallback(proposalInfo);
  }

  return new Date(Number(deadlineTimestampSeconds) * 1000);
};

// Following fallback logic follows what's originally implemented by the Dashboard

const SHORT_VOTING_PERIOD_SECONDS = 60 * 60 * 12; // 12 hours
const WAIT_FOR_QUIET_THRESHOLD_SECONDS = 60 * 60 * 24 * 4; // 4 days

const votingPeriodEndFallback = ({
  proposalTimestampSeconds,
  topic,
}: ProposalInfo): Date => {
  const durationInSeconds = [
    Topic.NeuronManagement,
    Topic.ExchangeRate,
  ].includes(topic)
    ? SHORT_VOTING_PERIOD_SECONDS
    : WAIT_FOR_QUIET_THRESHOLD_SECONDS;

  return new Date(
    Number(proposalTimestampSeconds) * 1000 + durationInSeconds * 1000
  );
};

/** Update proposal voting state as it participated in voting */
export const updateProposalVote = ({
  proposalInfo,
  neuron,
  vote,
}: {
  proposalInfo: ProposalInfo;
  neuron: NeuronInfo;
  vote: Vote | SnsVote;
}): ProposalInfo => {
  const { votingPower, neuronId } = neuron;
  const votedBallot: Ballot = {
    neuronId,
    vote: toNnsVote(vote),
    votingPower,
  };

  return {
    ...proposalInfo,
    ballots: [
      ...proposalInfo.ballots.filter(
        ({ neuronId }) => neuronId !== neuron.neuronId
      ),
      votedBallot,
    ],
    latestTally: {
      ...(proposalInfo.latestTally as Tally),
      yes:
        vote === Vote.Yes
          ? (proposalInfo.latestTally?.yes ?? 0n) + votingPower
          : proposalInfo.latestTally?.yes ?? 0n,
      no:
        vote === Vote.No
          ? (proposalInfo.latestTally?.no ?? 0n) + votingPower
          : proposalInfo.latestTally?.no ?? 0n,
    },
  };
};

/** Returns `registerVote` error reason text or undefined if not an error */
const registerVoteErrorReason = (
  neuronIdString: string,
  result: PromiseSettledResult<void>
): string | undefined => {
  if (result.status === "fulfilled") {
    return undefined;
  }

  const reason =
    result.reason instanceof Error ? errorToString(result.reason) : undefined;
  // detail text
  return replacePlaceholders(get(i18n).error.register_vote_neuron, {
    $neuronId: neuronIdString,
    $reason:
      reason === undefined || reason?.length === 0
        ? get(i18n).error.fail
        : reason,
  });
};

/** Returns `registerVote` error details (neuronId and the reason by error) */
export const registerVoteErrorDetails = ({
  responses,
  neuronIdStrings,
}: {
  responses: PromiseSettledResult<void>[];
  neuronIdStrings: string[];
}): string[] => {
  const details: string[] = responses
    .map((response, i) => registerVoteErrorReason(neuronIdStrings[i], response))
    .filter(isDefined);

  return details;
};

/** There are neurons in a queue whose vote is not yet been registered */
export const voteRegistrationActive = (
  votes: VoteRegistrationStoreEntry[]
): boolean =>
  votes.find(
    ({ neuronIdStrings, successfullyVotedNeuronIdStrings }) =>
      neuronIdStrings.length > successfullyVotedNeuronIdStrings.length
  ) !== undefined;

export const nnsNeuronToVotingNeuron = ({
  neuron,
  proposal,
}: {
  neuron: NeuronInfo;
  proposal: ProposalInfo;
}): VotingNeuron => ({
  neuronIdString: `${neuron.neuronId}`,
  votingPower: getVotingPower({ neuron, proposal }),
});

/** Navigate to the current universe (NNS/SNS) proposal page */
export const navigateToProposal = ({
  proposalId,
  universe,
  actionable,
}: ProposalsNavigationId & { actionable: boolean }): Promise<void> =>
  goto(
    buildProposalUrl({
      universe,
      proposalId,
      actionable,
    })
  );

export const getUniversalProposalStatus = (
  proposal: ProposalInfo
): UniversalProposalStatus => {
  const statusTypeMap: Record<ProposalStatus, UniversalProposalStatus> = {
    [ProposalStatus.Unknown]: "unknown",
    [ProposalStatus.Open]: "open",
    [ProposalStatus.Rejected]: "rejected",
    [ProposalStatus.Accepted]: "adopted",
    [ProposalStatus.Executed]: "executed",
    [ProposalStatus.Failed]: "failed",
  };
  const statusType = statusTypeMap[proposal.status];

  if (isNullish(statusType)) {
    throw new Error(`Unknown proposal status: ${proposal.status}`);
  }

  return statusType;
};

export const getVoteDisplay = (vote: Vote): string => {
  const i18nObj = get(i18n);
  switch (vote) {
    case Vote.Yes:
      return i18nObj.core.yes;
    case Vote.No:
      return i18nObj.core.no;
    case Vote.Unspecified:
      return i18nObj.core.unspecified;
  }
};

/** Compares two ProposalsNavigationId objects by universe and proposalId.
 *  First universes are compared based on their index in the provided universes array.
 *  If the universes are the same, the comparator then compares the proposalIds
 *  (proposal IDs are ordered in decreasing order).
 */
export const navigationIdComparator = ({
  a,
  b,
  universes,
}: {
  a: ProposalsNavigationId;
  b: ProposalsNavigationId;
  universes: UniverseCanisterIdText[];
}) => {
  const aUniverseIndex = universes.indexOf(a.universe);
  const bUniverseIndex = universes.indexOf(b.universe);
  if (aUniverseIndex > bUniverseIndex) {
    return 1;
  }
  if (aUniverseIndex < bUniverseIndex) {
    return -1;
  }
  if (a.proposalId < b.proposalId) return 1;
  if (a.proposalId > b.proposalId) return -1;
  return 0;
};

/**
 * Sort NNS proposals by IDs in descending order.
 */
export const sortProposalsByIdDescendingOrder = (
  proposals: ProposalInfo[]
): ProposalInfo[] =>
  [...proposals].sort((a, b) => {
    const idA = a.id ?? 0n;
    const idB = b.id ?? 0n;
    if (idB > idA) return 1;
    if (idB < idA) return -1;
    return 0;
  });
