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
import { ProposalStatus, Topic, Vote } from "@dfinity/nns";
import { get } from "svelte/store";
import { PROPOSAL_COLOR } from "../constants/proposals.constants";
import { i18n } from "../stores/i18n";
import type { ProposalsFiltersStore } from "../stores/proposals.store";
import type { VoteInProgress } from "../stores/voting.store";
import type { Color } from "../types/theme";
import { nowInSeconds } from "./date.utils";
import { errorToString } from "./error.utils";
import { replacePlaceholders } from "./i18n.utils";
import { isDefined } from "./utils";

export const lastProposalId = (
  proposalInfos: ProposalInfo[]
): ProposalId | undefined => {
  const { length, [length - 1]: last } = proposalInfos;
  return last?.id;
};

export const proposalFirstActionKey = (
  proposal: Proposal | undefined
): string | undefined => Object.keys(proposal?.action ?? {})[0];

export const proposalActionFields = (
  proposal: Proposal
): [string, unknown][] => {
  const key = proposalFirstActionKey(proposal);
  if (key === undefined) {
    return [];
  }
  return Object.entries(proposal.action?.[key] ?? {}).filter(([, value]) => {
    switch (typeof value) {
      case "object":
        return value && Object.keys(value).length > 0;
      case "string":
      case "bigint":
      case "boolean":
      case "number":
        return true;
    }
    return false;
  });
};

export const getExecuteNnsFunctionId = (
  proposal: Proposal | undefined
): number | undefined => {
  const action = proposalFirstActionKey(proposal);

  if (action !== "ExecuteNnsFunction") {
    return undefined;
  }

  // 0 equals Unspecified
  const { nnsFunctionId }: ExecuteNnsFunction = proposal?.action?.[action] ?? {
    nnsFunctionId: 0,
  };
  return nnsFunctionId;
};

export const hideProposal = ({
  proposalInfo,
  filters,
  neurons,
}: {
  proposalInfo: ProposalInfo;
  filters: ProposalsFiltersStore;
  neurons: NeuronInfo[];
}): boolean =>
  !matchFilters({ proposalInfo, filters }) ||
  isExcludedVotedProposal({ proposalInfo, filters, neurons });

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
  const { topics, rewards, status } = filters;

  const {
    topic: proposalTopic,
    status: proposalStatus,
    rewardStatus,
  } = proposalInfo;

  return (
    topics.includes(proposalTopic) &&
    rewards.includes(rewardStatus) &&
    status.includes(proposalStatus)
  );
};

/**
 * Hide a proposal if checkbox "excludeVotedProposals" is selected and the proposal is OPEN and has at least one UNSPECIFIED ballots' vote.
 */
const isExcludedVotedProposal = ({
  proposalInfo,
  filters,
  neurons,
}: {
  proposalInfo: ProposalInfo;
  filters: ProposalsFiltersStore;
  neurons: NeuronInfo[];
}): boolean => {
  const { excludeVotedProposals } = filters;

  const { ballots } = proposalInfo;
  const belongsToValidNeuron = (id: NeuronId) =>
    neurons.find(({ neuronId }) => neuronId === id) !== undefined;
  const containsUnspecifiedBallot = (): boolean =>
    ballots.find(
      ({ vote, neuronId }) =>
        // TODO: This is temporary solution. Will be replaced with L2-507
        // ignore neuronIds in ballots that are not in the neuron list of the user.
        // Otherwise it is confusing that there are proposals in the filtered list that can't vote.
        belongsToValidNeuron(neuronId) && vote === Vote.UNSPECIFIED
    ) !== undefined;

  return (
    excludeVotedProposals &&
    isProposalOpenForVotes(proposalInfo) &&
    !containsUnspecifiedBallot()
  );
};

/**
 * Do we have any proposals that match the filters to render or should we display the user that nothing was found?
 */
export const hasMatchingProposals = ({
  proposals,
  filters,
  neurons,
}: {
  proposals: ProposalInfo[];
  filters: ProposalsFiltersStore;
  neurons: NeuronInfo[];
}): boolean => {
  if (proposals.length === 0) {
    return false;
  }

  return (
    proposals.find(
      (proposalInfo: ProposalInfo) =>
        !hideProposal({ proposalInfo, filters, neurons })
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
  proposal,
}: {
  neurons: NeuronInfo[];
  selectedIds: NeuronId[];
  proposal: ProposalInfo;
}): bigint =>
  neurons
    .filter(({ neuronId }) => selectedIds.includes(neuronId))
    .map((neuron) => getVotingPower({ neuron, proposal }))
    .reduce((sum, votingPower) => sum + votingPower, BigInt(0));

/**
 * Generate new selected neuron id list after new neurons response w/o spoiling the previously done user selection
 */
export const preserveNeuronSelectionAfterUpdate = ({
  selectedIds,
  neurons,
  updatedNeurons,
}: {
  selectedIds: NeuronId[];
  neurons: NeuronInfo[];
  updatedNeurons: NeuronInfo[];
}): NeuronId[] => {
  const newIds = new Set(updatedNeurons.map(({ neuronId }) => neuronId));
  const oldIds = new Set(neurons.map(({ neuronId }) => neuronId));
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
 * Compares proposals by "id"
 */
export const replaceAndConcatenateProposals = ({
  oldProposals,
  newProposals,
}: {
  oldProposals: ProposalInfo[];
  newProposals: ProposalInfo[];
}): ProposalInfo[] => {
  const updatedProposals = (oldProposals = oldProposals.map(
    (stateProposal) =>
      newProposals.find(({ id }) => stateProposal.id === id) || stateProposal
  ));

  return concatenateUniqueProposals({
    oldProposals: updatedProposals,
    newProposals,
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
  color: Color | undefined;
  deadline: bigint | undefined;

  topic: string | undefined;
  topicDescription: string | undefined;
  type: string | undefined;
  typeDescription: string | undefined;
  status: ProposalStatus;
  statusString: string;
  statusDescription: string | undefined;
};

export const mapProposalInfo = (
  proposalInfo: ProposalInfo
): ProposalInfoMap => {
  const { proposal, proposer, id, status, deadlineTimestampSeconds } =
    proposalInfo;

  const { topics, topics_description, status_description, status: statusLabels } = get(i18n);
  const deadline =
    deadlineTimestampSeconds === undefined
      ? undefined
      : deadlineTimestampSeconds - BigInt(nowInSeconds());

  const topicKey: string = Topic[proposalInfo?.topic];

  const statusKey: string = ProposalStatus[status];

  return {
    id,
    proposer,
    proposal,
    title: proposal?.title,
    url: proposal?.url,
    color: PROPOSAL_COLOR[status],
    deadline,
    topic: topics[topicKey],
    topicDescription: topics_description[topicKey],
    status,
    statusString: statusLabels[statusKey],
    statusDescription: status_description[statusKey],
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
    execute_nns_functions,
    execute_nns_functions_description,
  } = get(i18n);

  const NO_MATCH = { type: undefined, typeDescription: undefined };

  if (proposal === undefined) {
    return NO_MATCH;
  }

  const nnsFunctionId = getExecuteNnsFunctionId(proposal);

  if (nnsFunctionId !== undefined) {
    return {
      type: execute_nns_functions[nnsFunctionId],
      typeDescription: execute_nns_functions_description[nnsFunctionId],
    };
  }

  const action: string | undefined = proposalFirstActionKey(proposal);

  return action !== undefined
    ? { type: actions[action], typeDescription: actions_description[action] }
    : NO_MATCH;
};

/**
 * A proposal can be accepted or declined if the majority votes before its duration expires but, it remains open for voting until then.
 * That is why we should not consider the status "OPEN" to present a proposal as open for voting but consider the duration.
 */
export const isProposalOpenForVotes = (proposalInfo: ProposalInfo): boolean =>
  votingPeriodEnd(proposalInfo).getTime() >= new Date().getTime();

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
  const durationInSeconds: number = [
    Topic.ManageNeuron,
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
  vote: Vote;
}): ProposalInfo => {
  const { votingPower, neuronId } = neuron;
  const votedBallot: Ballot = {
    neuronId,
    vote,
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
        vote === Vote.YES
          ? (proposalInfo.latestTally?.yes ?? BigInt(0)) + votingPower
          : proposalInfo.latestTally?.yes ?? BigInt(0),
      no:
        vote === Vote.NO
          ? (proposalInfo.latestTally?.no ?? BigInt(0)) + votingPower
          : proposalInfo.latestTally?.no ?? BigInt(0),
    },
  };
};

/** Returns `registerVote` error reason text or undefined if not an error */
const registerVoteErrorReason = (
  neuronId: NeuronId,
  result: PromiseSettledResult<void>
): string | undefined => {
  if (result.status === "fulfilled") {
    return undefined;
  }

  const reason =
    result.reason instanceof Error ? errorToString(result.reason) : undefined;
  // detail text
  return replacePlaceholders(get(i18n).error.register_vote_neuron, {
    $neuronId: neuronId.toString(),
    $reason:
      reason === undefined || reason?.length === 0
        ? get(i18n).error.fail
        : reason,
  });
};

/** Returns `registerVote` error details (neuronId and the reason by error) */
export const registerVoteErrorDetails = ({
  responses,
  neuronIds,
}: {
  responses: PromiseSettledResult<void>[];
  neuronIds: bigint[];
}): string[] => {
  const details: string[] = responses
    .map((response, i) => registerVoteErrorReason(neuronIds[i], response))
    .filter(isDefined);

  return details;
};

/** There are neurons in a queue whose vote is not yet been registered */
export const voteRegistrationActive = (votes: VoteInProgress[]): boolean =>
  votes.find(
    ({ neuronIds, successfullyVotedNeuronIds }) =>
      neuronIds.length > successfullyVotedNeuronIds.length
  ) !== undefined;
