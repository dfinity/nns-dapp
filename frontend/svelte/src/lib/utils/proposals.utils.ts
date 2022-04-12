import type {
  NeuronId,
  NeuronInfo,
  Proposal,
  ProposalId,
  ProposalInfo,
} from "@dfinity/nns";
import { ProposalStatus, Vote } from "@dfinity/nns";
import type { ProposalsFiltersStore } from "../stores/proposals.store";
import { isDefined, stringifyJson } from "./utils";

export const emptyProposals = ({ length }: ProposalInfo[]): boolean =>
  length <= 0;

export const lastProposalId = (
  proposalInfos: ProposalInfo[]
): ProposalId | undefined => {
  const { length, [length - 1]: last } = proposalInfos;
  return last?.id;
};

export const proposalFirstActionKey = (
  proposal: Proposal
): string | undefined => Object.keys(proposal.action || {})[0];

/**
 * Temporary solution till JSON renderer
 * (removes redundant wrappers)
 */
const mockFlutterJSONFormatting = (value: string = ""): string => {
  // "text" -> text
  let formattedText = value.replace(/^"(.*)"$/g, "$1");
  // "123" -> 123 (bigint is a string because of poor JSON.stringify support. See stringifyJson)
  formattedText = formattedText.replace(/"([\d]+)"/g, "$1");
  // \" -> "
  formattedText = formattedText.replace(/\\"/g, '"');
  return formattedText;
};

export const proposalActionFields = (
  proposal: Proposal
): [string, string][] => {
  const key = proposalFirstActionKey(proposal);
  if (key === undefined) {
    return [];
  }

  return Object.entries(proposal.action?.[key] ?? {})
    .filter(([key]) => key !== "payloadBytes")
    .map(([key, value]: [string, object]) => [
      key,
      mockFlutterJSONFormatting(stringifyJson(value, { indentation: 2 })),
    ]);
};

// TODO: replace w/ markdown renderer -- eg https://nns.ic0.app/#/proposal/43574
export const formatProposalSummary = (summary: string): string => {
  if (summary?.length === 0) return "";
  // extend urls
  return summary.replace(
    /(https?:\/\/[\S]+)/g,
    '<a target="_blank" href="$1">$1</a>'
  );
};

export const hideProposal = ({
  proposalInfo,
  filters,
}: {
  proposalInfo: ProposalInfo;
  filters: ProposalsFiltersStore;
}): boolean =>
  !matchFilters({ proposalInfo, filters }) ||
  isExcludedVotedProposal({ proposalInfo, filters });

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
}: {
  proposalInfo: ProposalInfo;
  filters: ProposalsFiltersStore;
}): boolean => {
  const { excludeVotedProposals } = filters;

  const { status, ballots } = proposalInfo;
  const containsUnspecifiedBallot = (): boolean =>
    // Sometimes ballots contains all neurons with Vote.UNSPECIFIED
    // something ballots is empty (inconsistent backend behaviour)
    ballots?.length === 0
      ? true
      : ballots.find(({ vote }) => vote === Vote.UNSPECIFIED) !== undefined;
  return (
    excludeVotedProposals &&
    status === ProposalStatus.PROPOSAL_STATUS_OPEN &&
    !containsUnspecifiedBallot()
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

export const selectedNeuronsVotingPower = ({
  neurons,
  selectedIds,
}: {
  neurons: NeuronInfo[];
  selectedIds: NeuronId[];
}): bigint =>
  neurons
    .filter(({ neuronId }) => selectedIds.includes(neuronId))
    .reduce((sum, { votingPower }) => sum + votingPower, BigInt(0));

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
