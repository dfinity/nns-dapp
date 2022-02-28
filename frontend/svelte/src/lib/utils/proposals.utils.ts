import type { ProposalId, ProposalInfo } from "@dfinity/nns";
import { ProposalStatus, Vote } from "@dfinity/nns";

export const emptyProposals = ({ length }: ProposalInfo[]): boolean =>
  length <= 0;

export const lastProposalId = (
  proposalInfos: ProposalInfo[]
): ProposalId | undefined => {
  const { length, [length - 1]: last } = proposalInfos;
  return last?.id;
};

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
  if (!proposals.length) {
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
