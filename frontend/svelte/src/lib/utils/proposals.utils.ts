import type {
  NeuronId,
  NeuronInfo,
  Proposal,
  ProposalId,
  ProposalInfo,
} from "@dfinity/nns";
import { ProposalStatus, Vote } from "@dfinity/nns";
import { E8S_PER_ICP } from "../constants/icp.constants";
import { formatNumber } from "./format.utils";
import { stringifyJson } from "./utils";

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

  // TODO: https://dfinity.atlassian.net/browse/L2-348
  return Object.entries(proposal.action?.[key])
    .filter(([key]) => key !== "payloadBytes")
    .map(([key, value]: [string, object]) => [
      key,
      mockFlutterJSONFormatting(stringifyJson(value, { indentation: 2 })),
    ]);
};

export const formatVotingPower = (value: bigint): string =>
  formatNumber(Number(value) / E8S_PER_ICP);

/**
 * Hide a proposal if checkbox "excludeVotedProposals" is selected and the proposal is OPEN and has at least one UNSPECIFIED ballots' vote.
 */
export const hideProposal = ({
  proposalInfo,
  excludeVotedProposals,
}: {
  proposalInfo: ProposalInfo;
  excludeVotedProposals: boolean;
}): boolean => {
  const { status, ballots } = proposalInfo;

  return (
    excludeVotedProposals &&
    status === ProposalStatus.PROPOSAL_STATUS_OPEN &&
    ballots.find(({ vote }) => vote !== Vote.UNSPECIFIED) !== undefined
  );
};

/**
 * Do we have any proposals that match the filters to render or should we display the user that nothing was found?
 */
export const hasMatchingProposals = ({
  proposals,
  excludeVotedProposals,
}: {
  proposals: ProposalInfo[];
  excludeVotedProposals: boolean;
}): boolean => {
  if (proposals.length === 0) {
    return false;
  }

  if (!excludeVotedProposals) {
    return true;
  }

  return (
    proposals.find(
      (proposalInfo: ProposalInfo) =>
        !hideProposal({ proposalInfo, excludeVotedProposals })
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
