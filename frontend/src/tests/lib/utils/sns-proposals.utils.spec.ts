import { ALL_SNS_PROPOSAL_TYPES_NS_FUNCTION_ID } from "$lib/constants/sns-proposals.constants";
import type { Filter, SnsProposalTypeFilterId } from "$lib/types/filters";
import { ALL_SNS_GENERIC_PROPOSAL_TYPES_ID } from "$lib/types/filters";
import { nowInSeconds } from "$lib/utils/date.utils";
import { enumValues } from "$lib/utils/enum.utils";
import {
  ballotVotingPower,
  fromPercentageBasisPoints,
  generateSnsProposalTypesFilterData,
  getUniversalProposalStatus,
  isAccepted,
  lastProposalId,
  mapProposalInfo,
  proposalActionFields,
  proposalOnlyActionKey,
  snsDecisionStatus,
  snsNeuronToVotingNeuron,
  snsProposalAcceptingVotes,
  snsProposalId,
  snsProposalIdString,
  snsRewardStatus,
  sortSnsProposalsById,
  toExcludeTypeParameter,
} from "$lib/utils/sns-proposals.utils";
import {
  allTopicsNervousSystemFunctionMock,
  genericNervousSystemFunctionMock,
  nativeNervousSystemFunctionMock,
  nervousSystemFunctionMock,
} from "$tests/mocks/sns-functions.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import {
  createSnsProposal,
  mockSnsProposal,
} from "$tests/mocks/sns-proposals.mock";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsVote,
  type SnsAction,
  type SnsNervousSystemFunction,
  type SnsNeuron,
  type SnsPercentage,
  type SnsProposalData,
  type SnsTally,
} from "@dfinity/sns";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";

describe("sns-proposals utils", () => {
  const acceptedTally = {
    yes: 10n,
    no: 2n,
    total: 20n,
    timestamp_seconds: 1n,
  };
  const rejectedTally = {
    yes: 10n,
    no: 20n,
    total: 30n,
    timestamp_seconds: 1n,
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
        decided_timestamp_seconds: 0n,
      };
      expect(snsDecisionStatus(proposal)).toBe(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN
      );
    });

    it("should return EXECUTED status", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: 10n,
        executed_timestamp_seconds: 10n,
        latest_tally: [acceptedTally],
      };
      expect(snsDecisionStatus(proposal)).toBe(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED
      );
    });

    it("should return FAILED status", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: 10n,
        executed_timestamp_seconds: 0n,
        failed_timestamp_seconds: 10n,
        latest_tally: [acceptedTally],
      };
      expect(snsDecisionStatus(proposal)).toBe(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED
      );
    });

    it("should return ADOPTED status", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: 10n,
        executed_timestamp_seconds: 0n,
        failed_timestamp_seconds: 0n,
        latest_tally: [acceptedTally],
      };
      expect(snsDecisionStatus(proposal)).toBe(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED
      );
    });

    it("should return REJECTED status", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        decided_timestamp_seconds: 10n,
        executed_timestamp_seconds: 0n,
        failed_timestamp_seconds: 0n,
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
        reward_event_round: 2n,
      };
      expect(snsRewardStatus(proposal)).toBe(
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED
      );
    });

    it("should return SETTLED based on reward event end timestamp", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        reward_event_round: 0n,
        reward_event_end_timestamp_seconds: [0n],
      };
      expect(snsRewardStatus(proposal)).toBe(
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED
      );
    });

    it("should return ACCEPT_VOTES", () => {
      const now = BigInt(nowInSeconds());
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        reward_event_round: 0n,
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: now + 100n,
          },
        ],
      };
      expect(snsRewardStatus(proposal)).toBe(
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES
      );
    });

    it("should return ACCEPT_VOTES w/o current_deadline_timestamp_seconds ", () => {
      const now = BigInt(nowInSeconds());
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        reward_event_round: 0n,
        wait_for_quiet_state: [],
        proposal_creation_timestamp_seconds: now,
        initial_voting_period_seconds: 100n,
      };
      expect(snsRewardStatus(proposal)).toBe(
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES
      );
    });

    it("should return READY_TO_SETTLE", () => {
      const now = BigInt(nowInSeconds());
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        reward_event_round: 0n,
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: now - 100n,
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
        reward_event_round: 0n,
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: now - 100n,
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
        decided_timestamp_seconds: 0n,
        reward_event_round: 0n,
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: now + 100n,
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
        decided_timestamp_seconds: 0n,
        reward_event_round: 0n,
        wait_for_quiet_state: [
          {
            current_deadline_timestamp_seconds: now - 100n,
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
      const current_deadline_timestamp_seconds = 1_123n;
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
        id: [{ id: 1n }],
      };
      const proposal2: SnsProposalData = {
        ...mockSnsProposal,
        id: [{ id: 2n }],
      };
      const proposal3: SnsProposalData = {
        ...mockSnsProposal,
        id: [{ id: 3n }],
      };
      const proposalId = lastProposalId([proposal3, proposal1, proposal2]);
      expect(proposalId.id).toEqual(1n);
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
        id: [{ id: 1n }],
      };
      const proposal2: SnsProposalData = {
        ...mockSnsProposal,
        id: [{ id: 2n }],
      };
      const proposal3: SnsProposalData = {
        ...mockSnsProposal,
        id: [{ id: 3n }],
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

  describe("snsProposalId", () => {
    it("should return proposal id", () => {
      const testId = 123_987n;
      const testProposal: SnsProposalData = {
        ...mockSnsProposal,
        id: [
          {
            id: testId,
          },
        ],
      };
      expect(snsProposalId(testProposal)).toEqual(testId);
    });
  });

  describe("snsProposalIdString", () => {
    it("should stringify proposal id", () => {
      const testId = 123_987n;
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

  describe("snsProposalAcceptingVotes", () => {
    it("should return true when proposals is still accepting votes", () => {
      const decisionStatus = enumValues(SnsProposalDecisionStatus);
      const proposals = decisionStatus.map((status) =>
        createSnsProposal({
          status,
          rewardStatus:
            SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
          proposalId: 123n,
        })
      );
      const openProposals = proposals
        .map(snsProposalAcceptingVotes)
        .filter(Boolean);
      expect(openProposals.length).toBe(proposals.length);
    });

    it("should return false when proposal is ready to settle", () => {
      const testProposal: SnsProposalData = createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED,
        rewardStatus:
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_READY_TO_SETTLE,
        proposalId: 123n,
      });
      expect(snsProposalAcceptingVotes(testProposal)).toBe(false);
    });

    it("should return false when proposal is settled", () => {
      const testProposal: SnsProposalData = createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED,
        rewardStatus: SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED,
        proposalId: 123n,
      });
      expect(snsProposalAcceptingVotes(testProposal)).toBe(false);
    });
  });

  describe("ballotVotingPower", () => {
    const testNeuron: SnsNeuron = {
      ...mockSnsNeuron,
      id: [{ id: arrayOfNumberToUint8Array([1, 2, 3]) }],
    };

    it("should return the voting power of the ballot for a specific neuron", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        ballots: [
          [
            "010203", // neuron id
            {
              vote: SnsVote.Yes,
              voting_power: 250n,
              cast_timestamp_seconds: 122n,
            },
          ],
        ],
      };
      expect(
        ballotVotingPower({
          neuron: testNeuron,
          proposal,
        })
      ).toBe(250n);
    });

    it("should return 0 voting power if neuron doesn't have a ballot", () => {
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        ballots: [],
      };
      expect(
        ballotVotingPower({
          neuron: testNeuron,
          proposal,
        })
      ).toBe(0n);
    });
  });

  describe("snsNeuronToVotingNeuron", () => {
    it("should create VotingNeuron out of SnsNeuron with voting power from ballot", () => {
      const testNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        id: [{ id: arrayOfNumberToUint8Array([1, 2, 3]) }],
        staked_maturity_e8s_equivalent: [],
        maturity_e8s_equivalent: 0n,
        neuron_fees_e8s: 0n,
        dissolve_state: [{ DissolveDelaySeconds: 100n }],
        aging_since_timestamp_seconds: 0n,
        voting_power_percentage_multiplier: 100n,
        cached_neuron_stake_e8s: 100n,
      };
      const proposal: SnsProposalData = {
        ...mockSnsProposal,
        ballots: [
          [
            "010203", // neuron id
            {
              vote: SnsVote.Yes,
              voting_power: 250n,
              cast_timestamp_seconds: 122n,
            },
          ],
        ],
      };
      expect(
        snsNeuronToVotingNeuron({
          neuron: testNeuron,
          proposal,
        })
      ).toEqual({
        neuronIdString: "010203",
        votingPower: 250n,
      });
    });
  });

  describe("getUniversalProposalStatus", () => {
    it("should return UniversalProposalStatus", () => {
      expect(
        getUniversalProposalStatus(
          createSnsProposal({
            proposalId: 0n,
            status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
          })
        )
      ).toBe("open");
      expect(
        getUniversalProposalStatus(
          createSnsProposal({
            proposalId: 0n,
            status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED,
          })
        )
      ).toBe("executed");
      expect(
        getUniversalProposalStatus(
          createSnsProposal({
            proposalId: 0n,
            status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED,
          })
        )
      ).toBe("failed");
      expect(
        getUniversalProposalStatus(
          createSnsProposal({
            proposalId: 0n,
            status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED,
          })
        )
      ).toBe("adopted");
      expect(
        getUniversalProposalStatus(
          createSnsProposal({
            proposalId: 0n,
            status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_REJECTED,
          })
        )
      ).toBe("rejected");
    });
  });

  describe("sns types filter", () => {
    const filterEntry: Filter<SnsProposalTypeFilterId> = {
      id: "1",
      name: "Motion",
      value: "1",
      checked: true,
    };
    const allSnsGenericFilterEntry: Filter<SnsProposalTypeFilterId> = {
      id: ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
      name: "All test_sns specific proposals",
      value: ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
      checked: true,
    };

    describe("generateSnsProposalTypesFilterData", () => {
      const nativeNervousSystemFunction1 = {
        ...nativeNervousSystemFunctionMock,
        id: 1n,
      };
      const nativeNervousSystemFunction2 = {
        ...nativeNervousSystemFunctionMock,
        id: 2n,
      };
      const nativeNervousSystemFunction3 = {
        ...nativeNervousSystemFunctionMock,
        id: 3n,
      };
      const genericNervousSystemFunctions1 = {
        ...genericNervousSystemFunctionMock,
        id: 1001n,
      };
      const genericNervousSystemFunctions2 = {
        ...genericNervousSystemFunctionMock,
        id: 1002n,
      };

      it("should use nsFunctions to create filter entries", () => {
        const nsFunctions: SnsNervousSystemFunction[] = [
          nativeNervousSystemFunction1,
          nativeNervousSystemFunction2,
        ];

        expect(
          generateSnsProposalTypesFilterData({
            nsFunctions,
            typesFilterState: [],
            snsName: "test_sns",
          })
        ).toStrictEqual([
          { ...filterEntry, id: "1", value: "1" },
          { ...filterEntry, id: "2", value: "2" },
        ]);
      });

      it('should ignore "All Topic" ns function', () => {
        const nsFunctions: SnsNervousSystemFunction[] = [
          allTopicsNervousSystemFunctionMock,
          nativeNervousSystemFunction1,
          nativeNervousSystemFunction2,
        ];

        expect(
          generateSnsProposalTypesFilterData({
            nsFunctions,
            typesFilterState: [],
            snsName: "test_sns",
          })
        ).toStrictEqual([
          { ...filterEntry, id: "1", value: "1" },
          { ...filterEntry, id: "2", value: "2" },
        ]);
      });

      it("should combine generic nsFunctions to a single entry", () => {
        const nsFunctions: SnsNervousSystemFunction[] = [
          nativeNervousSystemFunction1,
          genericNervousSystemFunctions1,
          genericNervousSystemFunctions2,
        ];

        expect(
          generateSnsProposalTypesFilterData({
            nsFunctions,
            typesFilterState: [],
            snsName: "test_sns",
          })
        ).toStrictEqual([filterEntry, allSnsGenericFilterEntry]);
      });

      it('should not have "All Generic" entry if no generic nsFunctions available', () => {
        const nsFunctions: SnsNervousSystemFunction[] = [
          nativeNervousSystemFunction1,
          nativeNervousSystemFunction2,
          nativeNervousSystemFunction3,
        ];

        expect(
          generateSnsProposalTypesFilterData({
            nsFunctions,
            typesFilterState: [],
            snsName: "test_sns",
          })
        ).not.toContain(allSnsGenericFilterEntry);
      });

      it("should preserve selection", () => {
        const nsFunctions: SnsNervousSystemFunction[] = [
          nativeNervousSystemFunction1,
          nativeNervousSystemFunction2,
          nativeNervousSystemFunction3,
        ];
        const typesFilterState = [
          {
            ...filterEntry,
            id: "1",
            value: "1",
            checked: false,
          },
          {
            ...filterEntry,
            id: "2",
            value: "2",
            checked: true,
          },
          {
            ...filterEntry,
            id: "3",
            value: "3",
            checked: false,
          },
        ];

        expect(
          generateSnsProposalTypesFilterData({
            nsFunctions,
            typesFilterState,
            snsName: "test_sns",
          })
        ).toStrictEqual(typesFilterState);
      });

      it("should select new entries", () => {
        const nsFunctions: SnsNervousSystemFunction[] = [
          nativeNervousSystemFunction1,
          nativeNervousSystemFunction2,
          nativeNervousSystemFunction3,
        ];
        const typesFilterState = [
          {
            ...filterEntry,
            id: "1",
            value: "1",
            checked: true,
          },
          {
            ...filterEntry,
            id: "3",
            value: "3",
            checked: false,
          },
        ];
        const result = [
          typesFilterState[0],
          {
            ...filterEntry,
            id: "2",
            value: "2",
            checked: true,
          },
          typesFilterState[1],
        ];

        expect(
          generateSnsProposalTypesFilterData({
            nsFunctions,
            typesFilterState,
            snsName: "test_sns",
          })
        ).toStrictEqual(result);
      });
    });
  });

  describe("toExcludeTypeParameter", () => {
    const allTypesNsFunctionId = ALL_SNS_PROPOSAL_TYPES_NS_FUNCTION_ID;
    const nativeNsFunctionId1 = 1n;
    const nativeNsFunctionId2 = 2n;
    const genericNsFunctionId1 = 1001n;
    const genericNsFunctionId2 = 1010n;
    // Prepare sns functions
    const allTopicsNativeNsFunction: SnsNervousSystemFunction = {
      ...nativeNervousSystemFunctionMock,
      id: allTypesNsFunctionId,
      name: "All Topics",
    };
    const nativeNsFunction1: SnsNervousSystemFunction = {
      ...nativeNervousSystemFunctionMock,
      id: nativeNsFunctionId1,
      name: "name",
    };
    const nativeNsFunction2: SnsNervousSystemFunction = {
      ...nativeNervousSystemFunctionMock,
      id: nativeNsFunctionId2,
      name: "name",
    };
    const genericNsFunction1: SnsNervousSystemFunction = {
      ...genericNervousSystemFunctionMock,
      id: genericNsFunctionId1,
      name: "name",
    };
    const genericNsFunction2: SnsNervousSystemFunction = {
      ...genericNervousSystemFunctionMock,
      id: genericNsFunctionId2,
      name: "name",
    };
    const snsFunctions: SnsNervousSystemFunction[] = [
      allTopicsNativeNsFunction,
      nativeNsFunction1,
      nativeNsFunction2,
      genericNsFunction1,
      genericNsFunction2,
    ];
    // Prepare type filters
    const nativeFilterEntry1 = (
      checked: boolean = false
    ): Filter<SnsProposalTypeFilterId> => ({
      id: String(nativeNsFunctionId1),
      name: "string 1",
      value: String(nativeNsFunctionId1),
      checked,
    });
    const nativeFilterEntry2 = (
      checked: boolean = false
    ): Filter<SnsProposalTypeFilterId> => ({
      id: String(nativeNsFunctionId2),
      name: "string 2",
      value: String(nativeNsFunctionId2),
      checked,
    });
    const allGenericFilterEntry = (
      checked: boolean = false
    ): Filter<SnsProposalTypeFilterId> => ({
      id: ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
      name: "string",
      value: ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
      checked,
    });

    it("should return empty list if nothing checked", () => {
      expect(
        toExcludeTypeParameter({
          filter: [],
          snsFunctions,
        })
      ).toStrictEqual([]);
    });

    it('should always exclude "All Topics"', () => {
      expect(
        toExcludeTypeParameter({
          filter: [],
          snsFunctions,
        }).find((id) => id === allTypesNsFunctionId)
      ).toBe(undefined);
      expect(
        toExcludeTypeParameter({
          filter: [
            nativeFilterEntry1(false),
            nativeFilterEntry2(false),
            allGenericFilterEntry(false),
          ],
          snsFunctions,
        }).find((id) => id === allTypesNsFunctionId)
      ).toBe(undefined);
      expect(
        toExcludeTypeParameter({
          filter: [
            nativeFilterEntry1(true),
            nativeFilterEntry2(true),
            allGenericFilterEntry(true),
          ],
          snsFunctions,
        }).find((id) => id === allTypesNsFunctionId)
      ).toBe(undefined);
    });

    it('should exclude all generics when "All $snsName specific proposals" is not checked', () => {
      expect(
        toExcludeTypeParameter({
          filter: [
            nativeFilterEntry1(true),
            nativeFilterEntry2(true),
            allGenericFilterEntry(false),
          ],
          snsFunctions,
        })
      ).toStrictEqual([genericNsFunctionId1, genericNsFunctionId2]);
    });

    it('should not exclude generic when "All $snsName specific proposals" is selected', () => {
      expect(
        toExcludeTypeParameter({
          filter: [
            nativeFilterEntry1(false),
            nativeFilterEntry2(false),
            allGenericFilterEntry(true),
          ],
          snsFunctions,
        })
      ).toStrictEqual([
        BigInt(nativeFilterEntry1().id),
        BigInt(nativeFilterEntry2().id),
      ]);
    });

    it("should exclude non selected entries", () => {
      expect(
        toExcludeTypeParameter({
          filter: [
            nativeFilterEntry1(true),
            nativeFilterEntry2(false),
            allGenericFilterEntry(false),
          ],
          snsFunctions,
        })
      ).toStrictEqual([
        BigInt(nativeFilterEntry2().id),
        genericNsFunctionId1,
        genericNsFunctionId2,
      ]);
    });
  });

  describe("fromPercentageBasisPoints", () => {
    it("should return basis points", () => {
      expect(
        fromPercentageBasisPoints([{ basis_points: [300n] } as SnsPercentage])
      ).toBe(300n);
    });

    it("should not break when no percentage provided", () => {
      expect(fromPercentageBasisPoints(undefined)).toBe(undefined);
    });
  });

  describe("isAccepted", () => {
    const from_percentage = (percentage: number): SnsPercentage => ({
      basis_points: [BigInt(percentage * 100)],
    });

    // Copy of https://gitlab.com/dfinity-lab/public/ic/-/blob/11b6d0797c89937541ef079d54b6320274c07236/rs/sns/governance/tests/proposal.rs#L693
    it("calculates isAccepted", () => {
      const p0 = {
        ...mockSnsProposal,
        latest_tally: [
          {
            yes: 0n,
            no: 0n,
            total: 10n,
            timestamp_seconds: 1n,
          } as SnsTally,
        ],
        proposal_creation_timestamp_seconds: 1n,
        initial_voting_period_seconds: 10n,
        minimum_yes_proportion_of_total: [from_percentage(0)],
      } as SnsProposalData;

      const p1 = {
        ...mockSnsProposal,
        latest_tally: [
          {
            yes: 2n,
            no: 0n,
            total: 10n,
            timestamp_seconds: 1n,
          } as SnsTally,
        ],
        proposal_creation_timestamp_seconds: 1n,
        initial_voting_period_seconds: 10n,
        minimum_yes_proportion_of_total: [from_percentage(0)],
      } as SnsProposalData;

      const p2 = {
        ...mockSnsProposal,
        latest_tally: [
          {
            yes: 2n,
            no: 0n,
            total: 10n,
            timestamp_seconds: 1n,
          } as SnsTally,
        ],
        proposal_creation_timestamp_seconds: 1n,
        initial_voting_period_seconds: 10n,
        minimum_yes_proportion_of_total: [from_percentage(10)],
      } as SnsProposalData;

      const p3 = {
        ...mockSnsProposal,
        latest_tally: [
          {
            yes: 2n,
            no: 0n,
            total: 10n,
            timestamp_seconds: 1n,
          } as SnsTally,
        ],
        proposal_creation_timestamp_seconds: 1n,
        initial_voting_period_seconds: 10n,
        minimum_yes_proportion_of_total: [from_percentage(20)],
      } as SnsProposalData;

      const p4 = {
        ...mockSnsProposal,
        latest_tally: [
          {
            yes: 2n,
            no: 0n,
            total: 10n,
            timestamp_seconds: 1n,
          } as SnsTally,
        ],
        proposal_creation_timestamp_seconds: 1n,
        initial_voting_period_seconds: 10n,
        minimum_yes_proportion_of_total: [from_percentage(30)],
      } as SnsProposalData;

      expect(isAccepted(p0)).toBe(false);
      expect(isAccepted(p1)).toBe(true);
      expect(isAccepted(p2)).toBe(true);
      expect(isAccepted(p3)).toBe(true);
      expect(isAccepted(p4)).toBe(false);
    });
  });
});
