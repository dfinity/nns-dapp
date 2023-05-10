import { nowInSeconds } from "$lib/utils/date.utils";
import {
  isAccepted,
  lastProposalId,
  mapProposalInfo,
  proposalActionFields,
  proposalOnlyActionKey,
  snsDecisionStatus,
  snsNeuronToVotingNeuron,
  snsProposalIdString,
  snsProposalOpen,
  snsRewardStatus,
  sortSnsProposalsById,
} from "$lib/utils/sns-proposals.utils";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import type {
  SnsAction,
  SnsNervousSystemParameters,
  SnsNeuron,
  SnsProposalData,
} from "@dfinity/sns";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
} from "@dfinity/sns";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import { vi } from "vitest";

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
      vi.useFakeTimers().setSystemTime(now);
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
            current_deadline_timestamp_seconds: now + BigInt(100),
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
            current_deadline_timestamp_seconds: now - BigInt(100),
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
            current_deadline_timestamp_seconds: now - BigInt(100),
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
      vi.useFakeTimers().setSystemTime(now);
    });
    it("should add statuses with text and description", () => {
      const now = BigInt(nowInSeconds());
      const proposalData: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: BigInt(0),
        reward_event_round: BigInt(0),
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: now + BigInt(100),
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

    it("should use the functions passed to set type and type description", () => {
      const proposalData = {
        ...mockSnsProposal,
        action: nervousSystemFunctionMock.id,
      } as SnsProposalData;

      const mappedProposal = mapProposalInfo({
        proposalData,
        nsFunctions: [nervousSystemFunctionMock],
      });
      expect(mappedProposal.type).toBe(nervousSystemFunctionMock.name);
      expect(mappedProposal.typeDescription).toBe(
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

  describe("proposalOnlyActionKey", () => {
    it("should find fist action key", () => {
      const firstKey = "UpgradeSnsToNextVersion";
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        proposal: [
          {
            ...mockSnsProposal.proposal[0],
            action: [{ [firstKey]: {} }],
          },
        ],
      };
      expect(proposalOnlyActionKey(proposal)).toEqual(firstKey);
    });

    it("should return undefined if no action or no proposal", () => {
      const proposalWithoutAction: SnsProposalData = {
        ...mockSnsProposal,
        proposal: [
          {
            ...mockSnsProposal.proposal[0],
            action: [],
          },
        ],
      };
      expect(proposalOnlyActionKey(proposalWithoutAction)).toBeUndefined();

      const proposalWithoutProposal: SnsProposalData = {
        ...mockSnsProposal,
        proposal: [],
      };
      expect(proposalOnlyActionKey(proposalWithoutProposal)).toBeUndefined();
    });
  });

  describe("proposalActionFields", () => {
    it("should return the properties of the action in a list", () => {
      const action = {
        Motion: {
          motion_text: "Test motion",
        },
      };
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        proposal: [
          {
            ...mockSnsProposal.proposal[0],
            action: [action],
          },
        ],
      };
      const fields = proposalActionFields(proposal);

      expect(fields).toEqual([["motion_text", "Test motion"]]);
    });

    it("should include undefined action fields", () => {
      // TODO: Convert action types to use `undefined | T` instead of `[] | [T]`.
      // That will mean that subaccount below shuold be rendered as `undefined` instead of not being present in the final array.
      const action: SnsAction = {
        ManageSnsMetadata: {
          url: ["www.internetcomputer.org"],
          logo: [],
          name: [],
          description: [],
        },
      };
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        proposal: [
          {
            ...mockSnsProposal.proposal[0],
            action: [action],
          },
        ],
      };
      const fields = proposalActionFields(proposal);

      expect(fields).toEqual([
        ["url", ["www.internetcomputer.org"]],
        ["logo", []],
        ["name", []],
        ["description", []],
      ]);
    });

    it("should return empty array if no action or no proposal", () => {
      const proposalWithoutAction: SnsProposalData = {
        ...mockSnsProposal,
        proposal: [
          {
            ...mockSnsProposal.proposal[0],
            action: [],
          },
        ],
      };
      expect(proposalActionFields(proposalWithoutAction)).toHaveLength(0);

      const proposalWithoutProposal: SnsProposalData = {
        ...mockSnsProposal,
        proposal: [],
      };
      expect(proposalActionFields(proposalWithoutProposal)).toHaveLength(0);
    });
  });

  describe("snsProposalIdString", () => {
    it("should stringify proposal id", () => {
      const testId = 123987n;
      const testProposal: SnsProposalData = {
        ...mockSnsProposal,
        id: [
          {
            id: testId,
          },
        ],
      };
      expect(snsProposalIdString(testProposal)).toEqual(`${testId}`);
    });
  });

  describe("snsProposalOpen", () => {
    it("should return true when proposal is in open state", () => {
      const testProposal: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: 0n,
      };
      expect(snsProposalOpen(testProposal)).toBe(true);
    });

    it("should return false when proposal is not in open state", () => {
      const testProposal: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: 123n,
      };
      expect(snsProposalOpen(testProposal)).toBe(false);
    });
  });

  describe("snsNeuronToVotingNeuron", () => {
    it("should create VotingNeuron out of SnsNeuron", () => {
      const testNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        id: [{ id: arrayOfNumberToUint8Array([1, 2, 3]) }],
        staked_maturity_e8s_equivalent: [],
        maturity_e8s_equivalent: BigInt(0),
        neuron_fees_e8s: 0n,
        dissolve_state: [{ DissolveDelaySeconds: 100n }],
        aging_since_timestamp_seconds: 0n,
        voting_power_percentage_multiplier: 100n,
        cached_neuron_stake_e8s: 100n,
      };
      const testParameters: SnsNervousSystemParameters = {
        ...snsNervousSystemParametersMock,
        max_dissolve_delay_seconds: [100n],
        max_neuron_age_for_age_bonus: [100n],
        max_dissolve_delay_bonus_percentage: [100n],
        max_age_bonus_percentage: [25n],
        neuron_minimum_dissolve_delay_to_vote_seconds: [0n],
      };
      expect(
        snsNeuronToVotingNeuron({
          neuron: testNeuron,
          snsParameters: testParameters,
        })
      ).toEqual({
        neuronIdString: "010203",
        votingPower: 250n,
      });
    });
  });
});
