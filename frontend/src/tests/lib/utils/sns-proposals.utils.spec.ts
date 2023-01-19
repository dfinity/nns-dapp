import { nowInSeconds } from "$lib/utils/date.utils";
import {
  isAccepted,
  lastProposalId,
  mapProposalInfo,
  snsDecisionStatus,
  snsRewardStatus,
  sortSnsProposalsById,
} from "$lib/utils/sns-proposals.utils";
import type { SnsProposalData } from "@dfinity/sns";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
} from "@dfinity/sns";
import { nervousSystemFunctionMock } from "../../mocks/sns-functions.mock";
import { mockSnsProposal } from "../../mocks/sns-proposals.mock";

describe("sns-proposals utils", () => {
  const acceptedTally = {
    yes: BigInt(10),
    no: BigInt(2),
    total: BigInt(20),
    timestamp_seconds: BigInt(1),
  };
  const rejectedTally = {
    yes: BigInt(10),
    no: BigInt(20),
    total: BigInt(30),
    timestamp_seconds: BigInt(1),
  };
  describe("isAccepted", () => {
    it("should return true if the proposal is accepted", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        latest_tally: [acceptedTally],
      };
      expect(isAccepted(proposal)).toBe(true);
    });

    it("should return false if the proposal is accepted", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        latest_tally: [rejectedTally],
      };
      expect(isAccepted(proposal)).toBe(false);
    });
  });

  describe("snsDecisionStatus", () => {
    it("should return OPEN status", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: BigInt(0),
      };
      expect(snsDecisionStatus(proposal)).toBe(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN
      );
    });

    it("should return EXECUTED status", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: BigInt(10),
        executed_timestamp_seconds: BigInt(10),
        latest_tally: [acceptedTally],
      };
      expect(snsDecisionStatus(proposal)).toBe(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED
      );
    });

    it("should return FAILED status", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: BigInt(10),
        executed_timestamp_seconds: BigInt(0),
        failed_timestamp_seconds: BigInt(10),
        latest_tally: [acceptedTally],
      };
      expect(snsDecisionStatus(proposal)).toBe(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED
      );
    });

    it("should return ADOPTED status", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: BigInt(10),
        executed_timestamp_seconds: BigInt(0),
        failed_timestamp_seconds: BigInt(0),
        latest_tally: [acceptedTally],
      };
      expect(snsDecisionStatus(proposal)).toBe(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED
      );
    });

    it("should return REJECTED status", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: BigInt(10),
        executed_timestamp_seconds: BigInt(0),
        failed_timestamp_seconds: BigInt(0),
        latest_tally: [rejectedTally],
      };
      expect(snsDecisionStatus(proposal)).toBe(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_REJECTED
      );
    });
  });

  describe("snsRewardStatus", () => {
    beforeEach(() => {
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
    });
    it("should return SETTLED", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        reward_event_round: BigInt(2),
      };
      expect(snsRewardStatus(proposal)).toBe(
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED
      );
    });

    it("should return ACCEPT_VOTES", () => {
      const now = BigInt(nowInSeconds());
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        reward_event_round: BigInt(0),
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: now - BigInt(100),
          },
        ],
      };
      expect(snsRewardStatus(proposal)).toBe(
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES
      );
    });

    it("should return READY_TO_SETTLE", () => {
      const now = BigInt(nowInSeconds());
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        reward_event_round: BigInt(0),
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: now + BigInt(100),
          },
        ],
        is_eligible_for_rewards: true,
      };
      expect(snsRewardStatus(proposal)).toBe(
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_READY_TO_SETTLE
      );
    });

    it("should return SETTLED if no case matches", () => {
      const now = BigInt(nowInSeconds());
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        reward_event_round: BigInt(0),
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: now + BigInt(100),
          },
        ],
        is_eligible_for_rewards: false,
      };
      expect(snsRewardStatus(proposal)).toBe(
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED
      );
    });
  });

  describe("mapProposalInfo", () => {
    beforeEach(() => {
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
    });
    it("should add statuses with text and description", () => {
      const now = BigInt(nowInSeconds());
      const proposalData: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: BigInt(0),
        reward_event_round: BigInt(0),
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: now - BigInt(100),
          },
        ],
      };
      const mappedProposal = mapProposalInfo({ proposalData, nsFunctions: [] });
      expect(mappedProposal.rewardStatus).toBe(
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES
      );
      expect(mappedProposal.rewardStatusString).toBeDefined();
      expect(mappedProposal.rewardStatusDescription).toBeDefined();
      expect(mappedProposal.status).toBe(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN
      );
      expect(mappedProposal.statusString).toBeDefined();
      expect(mappedProposal.statusDescription).toBeDefined();
    });

    it("should extract optional parameters from array", () => {
      const now = BigInt(nowInSeconds());
      const proposalData: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: BigInt(0),
        reward_event_round: BigInt(0),
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: now - BigInt(100),
          },
        ],
      };
      const mappedProposal = mapProposalInfo({ proposalData, nsFunctions: [] });
      expect(mappedProposal.id).not.toBeInstanceOf(Array);
      expect(mappedProposal.payload_text_rendering).not.toBeInstanceOf(Array);
      expect(mappedProposal.proposer).not.toBeInstanceOf(Array);
      expect(mappedProposal.latest_tally).not.toBeInstanceOf(Array);
    });

    it("should extract nested data to the first level", () => {
      const proposal = {
        title: "Title test",
        url: "https://test.com",
        summary: "Description test",
        action: [{ UpgradeSnsToNextVersion: {} }],
      };
      const current_deadline_timestamp_seconds = BigInt(1123);
      const proposalData = {
        ...mockSnsProposal,
        proposal: [proposal],
        wait_for_quiet_state: [{ current_deadline_timestamp_seconds }],
      } as SnsProposalData;

      const mappedProposal = mapProposalInfo({ proposalData, nsFunctions: [] });
      expect(mappedProposal.title).toBe(proposal.title);
      expect(mappedProposal.url).toBe(proposal.url);
      expect(mappedProposal.summary).toBe(proposal.summary);
      expect(mappedProposal.actionData).toBe(proposal.action[0]);
      expect(mappedProposal.current_deadline_timestamp_seconds).toBe(
        current_deadline_timestamp_seconds
      );
    });

    it("should use the functions passed to set topic and topic description", () => {
      const proposalData = {
        ...mockSnsProposal,
        action: nervousSystemFunctionMock.id,
      } as SnsProposalData;

      const mappedProposal = mapProposalInfo({
        proposalData,
        nsFunctions: [nervousSystemFunctionMock],
      });
      expect(mappedProposal.topic).toBe(nervousSystemFunctionMock.name);
      expect(mappedProposal.topicDescription).toBe(
        nervousSystemFunctionMock.description[0]
      );
    });
  });

  describe("lastProposalId", () => {
    it("should return the last proposal id", async () => {
      const proposal1: SnsProposalData = {
        ...mockSnsProposal,
        id: [{ id: BigInt(1) }],
      };
      const proposal2: SnsProposalData = {
        ...mockSnsProposal,
        id: [{ id: BigInt(2) }],
      };
      const proposal3: SnsProposalData = {
        ...mockSnsProposal,
        id: [{ id: BigInt(3) }],
      };
      const proposalId = lastProposalId([proposal3, proposal1, proposal2]);
      expect(proposalId.id).toEqual(BigInt(1));
    });

    it("should return undefined when empty array", () => {
      const proposalId = lastProposalId([]);
      expect(proposalId).toBeUndefined();
    });
  });

  describe("sortSnsProposalsById", () => {
    it("sorts proposals by id in descending", () => {
      const proposal1: SnsProposalData = {
        ...mockSnsProposal,
        id: [{ id: BigInt(1) }],
      };
      const proposal2: SnsProposalData = {
        ...mockSnsProposal,
        id: [{ id: BigInt(2) }],
      };
      const proposal3: SnsProposalData = {
        ...mockSnsProposal,
        id: [{ id: BigInt(3) }],
      };
      const sortedProposals = sortSnsProposalsById([
        proposal3,
        proposal1,
        proposal2,
      ]);
      expect(sortedProposals).toEqual([proposal3, proposal2, proposal1]);
    });

    it("returns undefined when array is undefined", () => {
      expect(sortSnsProposalsById(undefined)).toBeUndefined();
    });

    it("returns empty array when array is empty", () => {
      expect(sortSnsProposalsById([])).toEqual([]);
    });
  });
});
