import type { ProjectProposalData } from "$lib/stores/sns-proposals.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  type SnsBallot,
  type SnsProposalData,
  type SnsProposalId,
  type SnsTally,
} from "@dfinity/sns";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import type { Subscriber } from "svelte/store";

export const mockSnsProposal: SnsProposalData = {
  id: [
    {
      id: 2n,
    },
  ],
  payload_text_rendering: ["Payload text rendering"],
  action: 2n,
  failure_reason: [],
  ballots: [],
  reward_event_round: 1n,
  failed_timestamp_seconds: 0n,
  proposal_creation_timestamp_seconds: 12_313_123n,
  initial_voting_period_seconds: 0n,
  reject_cost_e8s: 10_000_000n,
  latest_tally: [
    {
      no: 10n,
      yes: 10n,
      total: 100_000n,
      timestamp_seconds: 22n,
    },
  ],
  wait_for_quiet_deadline_increase_seconds: 0n,
  decided_timestamp_seconds: 0n,
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
      current_deadline_timestamp_seconds: 10n,
    },
  ],
  is_eligible_for_rewards: true,
  executed_timestamp_seconds: 0n,
  reward_event_end_timestamp_seconds: [],
  minimum_yes_proportion_of_exercised: [],
  minimum_yes_proportion_of_total: [],
};

const acceptedTally: SnsTally = {
  no: 1n,
  yes: 10n,
  total: 11n,
  timestamp_seconds: 123_455n,
};

const rejectedTally: SnsTally = {
  no: 10n,
  yes: 1n,
  total: 11n,
  timestamp_seconds: 123_455n,
};

const addRewardStatusData = ({
  proposal,
  rewardStatus,
}: {
  proposal: SnsProposalData;
  rewardStatus?: SnsProposalRewardStatus;
}): SnsProposalData => {
  const now = BigInt(nowInSeconds());
  switch (rewardStatus) {
    case undefined:
      return proposal;
    case SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES:
      return {
        ...proposal,
        reward_event_round: 0n,
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: 10_000n + now,
          },
        ],
      };
    case SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED:
      return {
        ...proposal,
        reward_event_round: 0n,
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: 10_000n - now,
          },
        ],
      };
    case SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_READY_TO_SETTLE:
      return {
        ...proposal,
        reward_event_round: 0n,
        is_eligible_for_rewards: true,
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: 10_000n - now,
          },
        ],
      };
    default:
      throw new Error(`Unsupported Sns Reward Status: ${rewardStatus}`);
  }
};

/**
 * Returns a proposal with the cusotmized parameters.
 *
 * For the status, the logic of the function is based on the code in `snsDecisionStatus` sns proposal util.
 * Refecence: https://github.com/dfinity/ic/blob/226ab04e0984367da356bbe27c90447863d33a27/rs/sns/governance/src/proposal.rs#L717
 */
export const createSnsProposal = ({
  status,
  rewardStatus,
  proposalId,
  ballots = [],
  createdAt = 12_313_123n,
  action = mockSnsProposal.action,
}: {
  status: SnsProposalDecisionStatus;
  rewardStatus?: SnsProposalRewardStatus;
  proposalId: bigint;
  ballots?: Array<[string, SnsBallot]>;
  createdAt?: bigint;
  action?: bigint;
}): SnsProposalData => {
  const id: [SnsProposalId] = [{ id: proposalId }];
  const snsProposal = {
    ...mockSnsProposal,
    id,
    action,
    ballots,
  };
  switch (status) {
    case SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN:
      return addRewardStatusData({
        proposal: {
          ...snsProposal,
          latest_tally: [acceptedTally],
          decided_timestamp_seconds: 0n,
          proposal_creation_timestamp_seconds: createdAt,
        },
        rewardStatus,
      });
    case SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED:
      return addRewardStatusData({
        proposal: {
          ...snsProposal,
          latest_tally: [acceptedTally],
          decided_timestamp_seconds: 11_223n,
          executed_timestamp_seconds: 0n,
          failed_timestamp_seconds: 0n,
          proposal_creation_timestamp_seconds: createdAt,
        },
        rewardStatus,
      });
    case SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED:
      return addRewardStatusData({
        proposal: {
          ...snsProposal,
          latest_tally: [acceptedTally],
          decided_timestamp_seconds: 11_223n,
          executed_timestamp_seconds: 0n,
          failed_timestamp_seconds: 112_231_320n,
          proposal_creation_timestamp_seconds: createdAt,
        },
        rewardStatus,
      });
    case SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED:
      return addRewardStatusData({
        proposal: {
          ...snsProposal,
          latest_tally: [acceptedTally],
          decided_timestamp_seconds: 11_223n,
          executed_timestamp_seconds: 112_231_320n,
          failed_timestamp_seconds: 0n,
          proposal_creation_timestamp_seconds: createdAt,
        },
        rewardStatus,
      });
    case SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_REJECTED:
      return addRewardStatusData({
        proposal: {
          ...snsProposal,
          latest_tally: [rejectedTally],
          decided_timestamp_seconds: 11_223n,
          executed_timestamp_seconds: 0n,
          failed_timestamp_seconds: 0n,
          proposal_creation_timestamp_seconds: createdAt,
        },
        rewardStatus,
      });
    default:
      return addRewardStatusData({
        proposal: {
          ...snsProposal,
          proposal_creation_timestamp_seconds: createdAt,
        },
        rewardStatus,
      });
  }
};

export const buildMockSnsProposalsStoreSubscribe =
  ({
    universeIdText,
    proposals,
  }: {
    universeIdText: string;
    proposals: SnsProposalData[];
  }) =>
  (
    run: Subscriber<{ [universeIdText: string]: ProjectProposalData }>
  ): (() => void) => {
    run({
      [universeIdText]: {
        proposals,
        certified: true,
        completed: true,
      },
    });
    return () => undefined;
  };
