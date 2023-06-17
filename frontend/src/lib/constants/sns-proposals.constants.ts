import { SnsProposalDecisionStatus } from "@dfinity/sns";
import { ProposalStatusColor } from "./proposals.constants";

export const DEFAULT_SNS_PROPOSALS_PAGE_SIZE = 20;
// Reference: https://github.com/dfinity/ic/blob/226ab04e0984367da356bbe27c90447863d33a27/rs/sns/governance/src/proposal.rs#L42
export const SNS_MIN_NUMBER_VOTES_FOR_PROPOSAL_RATIO = 0.03;

export const SNS_PROPOSAL_COLOR: Record<
  SnsProposalDecisionStatus,
  ProposalStatusColor | undefined
> = {
  [SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED]:
    ProposalStatusColor.SUCCESS,
  [SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN]:
    ProposalStatusColor.WARNING,
  [SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_UNSPECIFIED]: undefined,
  [SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_REJECTED]:
    ProposalStatusColor.ERROR,
  [SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED]: undefined,
  [SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED]:
    ProposalStatusColor.ERROR,
};
