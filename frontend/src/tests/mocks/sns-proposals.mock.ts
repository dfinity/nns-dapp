import {
  SnsProposalDecisionStatus,
  type SnsProposalData,
  type SnsProposalId,
  type SnsTally,
} from "@dfinity/sns";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";

export const mockSnsProposal: SnsProposalData = {
  id: [
    {
      id: BigInt(2),
    },
  ],
  payload_text_rendering: ["Payload text rendering"],
  action: BigInt(2),
  failure_reason: [],
  ballots: [],
  reward_event_round: BigInt(1),
  failed_timestamp_seconds: BigInt(0),
  proposal_creation_timestamp_seconds: BigInt(12313123),
  initial_voting_period_seconds: BigInt(0),
  reject_cost_e8s: BigInt(10_000_000),
  latest_tally: [
    {
      no: BigInt(10),
      yes: BigInt(10),
      total: BigInt(100_000),
      timestamp_seconds: BigInt(22),
    },
  ],
  wait_for_quiet_deadline_increase_seconds: BigInt(0),
  decided_timestamp_seconds: BigInt(0),
  proposal: [
    {
      title: "Proposal title",
      summary: "Proposal description",
      url: "https://example.com",
      action: [{ UpgradeSnsToNextVersion: {} }],
    },
  ],
  proposer: [{ id: arrayOfNumberToUint8Array([1, 2, 3, 0, 0, 1]) }],
  wait_for_quiet_state: [
    {
      current_deadline_timestamp_seconds: BigInt(10),
    },
  ],
  is_eligible_for_rewards: true,
  executed_timestamp_seconds: BigInt(0),
  reward_event_end_timestamp_seconds: [],
};

const acceptedTally: SnsTally = {
  no: BigInt(1),
  yes: BigInt(10),
  total: BigInt(11),
  timestamp_seconds: BigInt(123455),
};

const rejectedTally: SnsTally = {
  no: BigInt(10),
  yes: BigInt(1),
  total: BigInt(11),
  timestamp_seconds: BigInt(123455),
};

export const createSnsProposal = ({
  status,
  proposalId,
}: {
  status: SnsProposalDecisionStatus;
  proposalId: bigint;
}): SnsProposalData => {
  const id: [SnsProposalId] = [{ id: proposalId }];
  switch (status) {
    case SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN:
      return {
        ...mockSnsProposal,
        id,
        decided_timestamp_seconds: BigInt(0),
      };
    case SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED:
      return {
        ...mockSnsProposal,
        id,
        latest_tally: [acceptedTally],
        decided_timestamp_seconds: BigInt(11223),
        executed_timestamp_seconds: BigInt(0),
        failed_timestamp_seconds: BigInt(0),
      };
    case SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED:
      return {
        ...mockSnsProposal,
        id,
        latest_tally: [acceptedTally],
        decided_timestamp_seconds: BigInt(11223),
        executed_timestamp_seconds: BigInt(0),
        failed_timestamp_seconds: BigInt(112231320),
      };
    case SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED:
      return {
        ...mockSnsProposal,
        id,
        latest_tally: [acceptedTally],
        decided_timestamp_seconds: BigInt(11223),
        executed_timestamp_seconds: BigInt(112231320),
        failed_timestamp_seconds: BigInt(0),
      };
    case SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_REJECTED:
      return {
        ...mockSnsProposal,
        id,
        latest_tally: [rejectedTally],
        decided_timestamp_seconds: BigInt(11223),
        executed_timestamp_seconds: BigInt(0),
        failed_timestamp_seconds: BigInt(0),
      };
  }
};
