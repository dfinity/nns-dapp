import type {
  Ballot,
  NeuronId,
  NeuronInfo,
  Proposal,
  ProposalId,
  ProposalInfo,
} from "@dfinity/nns";
import { ProposalStatus, Topic, Vote } from "@dfinity/nns";
import { get } from "svelte/store";
import {
  PROPOSAL_COLOR,
  type ProposalColor,
} from "../constants/proposals.constants";
import { i18n } from "../stores/i18n";
import type { ProposalsFiltersStore } from "../stores/proposals.store";
import { isDefined } from "./utils";

export const lastProposalId = (
  proposalInfos: ProposalInfo[]
): ProposalId | undefined => {
  const { length, [length - 1]: last } = proposalInfos;
  return last?.id;
};

export const proposalFirstActionKey = (
  proposal: Proposal
): string | undefined => Object.keys(proposal.action || {})[0];

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

export const getNnsFunctionId = (proposal: Proposal): number | undefined => {
  const key = proposalFirstActionKey(proposal);

  if (key !== "ExecuteNnsFunction") {
    return undefined;
  }

  return Object.values(proposal.action?.[key])?.[0] as number;
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

  const { status, ballots } = proposalInfo;
  const isOpen = status === ProposalStatus.PROPOSAL_STATUS_OPEN;
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

  return excludeVotedProposals && isOpen && !containsUnspecifiedBallot();
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

export const mapProposalInfo = (
  proposalInfo: ProposalInfo
): {
  id: ProposalId | undefined;
  proposal: Proposal | undefined;
  proposer: NeuronId | undefined;
  title: string | undefined;
  url: string | undefined;
  topic: string | undefined;
  color: ProposalColor | undefined;
  status: ProposalStatus;
} => {
  const { proposal, proposer, id, status } = proposalInfo;

  const { topics } = get(i18n);

  return {
    id,
    proposer,
    proposal,
    title: proposal?.title,
    topic: topics[Topic[proposalInfo?.topic]],
    url: proposal?.url,
    color: PROPOSAL_COLOR[status],
    status,
  };
};
