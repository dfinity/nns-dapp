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
    (status !== ProposalStatus.PROPOSAL_STATUS_OPEN ||
      ballots.find(({ vote }) => vote === Vote.UNSPECIFIED) !== undefined)
  );
};
