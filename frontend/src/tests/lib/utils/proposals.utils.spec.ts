import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import { nowInSeconds } from "$lib/utils/date.utils";
import { enumValues } from "$lib/utils/enum.utils";
import {
  concatenateUniqueProposals,
  excludeProposals,
  getNnsFunctionKey,
  getUniversalProposalStatus,
  getVoteDisplay,
  getVotingBallot,
  getVotingPower,
  hasMatchingProposals,
  hideProposal,
  isProposalDeadlineInTheFuture,
  lastProposalId,
  mapProposalInfo,
  navigationIdComparator,
  nnsNeuronToVotingNeuron,
  preserveNeuronSelectionAfterUpdate,
  proposalActionData,
  proposalFirstActionKey,
  proposalIdSet,
  proposalsHaveSameIds,
  replaceAndConcatenateProposals,
  replaceProposals,
  selectedNeuronsVotingPower,
  sortProposalsByIdDescendingOrder,
} from "$lib/utils/proposals.utils";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import {
  generateMockProposals,
  mockProposalInfo,
  proposalActionNnsFunction21,
  proposalActionRewardNodeProvider,
} from "$tests/mocks/proposal.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import type {
  Action,
  Ballot,
  ExecuteNnsFunction,
  KnownNeuron,
  NeuronInfo,
  Proposal,
  ProposalInfo,
} from "@dfinity/nns";
import {
  NnsFunction,
  ProposalRewardStatus,
  ProposalStatus,
  Topic,
  Vote,
} from "@dfinity/nns";

const proposalWithNnsFunctionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionNnsFunction21,
} as Proposal;

const proposalWithRewardNodeProviderAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionRewardNodeProvider,
} as Proposal;

const actionWithEmpty = {
  RewardNodeProvider: {
    nodeProvider: {
      id: "aaaaa-aa",
    },
    amountE8s: undefined,
    rewardMode: {
      RewardToNeuron: {
        dissolveDelaySeconds: 1_000n,
      },
    },
  },
} as Action;

const proposalWithActionWithUndefined = {
  ...mockProposalInfo.proposal,
  action: actionWithEmpty,
} as Proposal;

const toTestNnsVotingNode =
  (proposal: ProposalInfo = mockProposalInfo) =>
  (neuron: NeuronInfo) =>
    nnsNeuronToVotingNeuron({ neuron, proposal });

describe("proposals-utils", () => {
  it("should find no last proposal id", () =>
    expect(lastProposalId([])).toBeUndefined());

  it("should find fist action key", () =>
    expect(proposalFirstActionKey(proposalWithNnsFunctionAction)).toEqual(
      "ExecuteNnsFunction"
    ));

  describe("hideProposal", () => {
    it("hideProposal", () => {
      expect(
        hideProposal({
          proposalInfo: mockProposals[0],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
          },
        })
      ).toBe(false);

      expect(
        hideProposal({
          proposalInfo: mockProposals[1],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
          },
        })
      ).toBe(false);

      expect(
        hideProposal({
          proposalInfo: mockProposals[0],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
          },
        })
      ).toBe(false);

      expect(
        hideProposal({
          proposalInfo: mockProposals[1],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
          },
        })
      ).toBe(false);

      expect(
        hideProposal({
          proposalInfo: {
            ...mockProposals[0],
            ballots: [
              {
                neuronId: 0n,
                vote: Vote.Unspecified,
              } as Ballot,
            ],
          },
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
          },
        })
      ).toBe(false);

      expect(
        hideProposal({
          proposalInfo: {
            ...mockProposals[1],
            ballots: [
              {
                neuronId: 0n,
                vote: Vote.Unspecified,
              } as Ballot,
            ],
          },
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
          },
        })
      ).toBe(false);
    });

    it("should not hide proposal if a filter is empty", () => {
      expect(
        hideProposal({
          proposalInfo: mockProposals[0],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
            topics: [],
          },
        })
      ).toBe(false);

      expect(
        hideProposal({
          proposalInfo: mockProposals[0],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
            status: [],
          },
        })
      ).toBe(false);

      expect(
        hideProposal({
          proposalInfo: mockProposals[0],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
          },
        })
      ).toBe(false);
    });

    it("should hide proposal if does not match filter", () => {
      expect(
        hideProposal({
          proposalInfo: mockProposals[0],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
            topics: [Topic.Kyc],
          },
        })
      ).toBeTruthy();

      expect(
        hideProposal({
          proposalInfo: mockProposals[0],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
            status: [ProposalStatus.Executed],
          },
        })
      ).toBeTruthy();
    });

    it("should check for matched filter", () => {
      expect(
        hideProposal({
          proposalInfo: mockProposals[0],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
            topics: [Topic.Kyc],
          },
        })
      ).toBe(true);

      expect(
        hideProposal({
          proposalInfo: mockProposals[0],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
            topics: [Topic.Governance],
          },
        })
      ).toBe(false);
    });
  });

  describe("hasMatchingProposals", () => {
    it("should have matching proposals", () => {
      expect(
        hasMatchingProposals({
          proposals: mockProposals,
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
          },
        })
      ).toBeTruthy();

      expect(
        hasMatchingProposals({
          proposals: [
            ...mockProposals,
            {
              ...mockProposals[0],
              ballots: [
                {
                  neuronId: 0n,
                  vote: Vote.Unspecified,
                } as Ballot,
              ],
            },
          ],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
          },
        })
      ).toBeTruthy();

      expect(
        hasMatchingProposals({
          proposals: [
            ...mockProposals,
            {
              ...mockProposals[1],
              ballots: [
                {
                  neuronId: 0n,
                  vote: Vote.Unspecified,
                } as Ballot,
              ],
            },
          ],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
          },
        })
      ).toBeTruthy();
    });

    it("should not have matching proposals", () => {
      expect(
        hasMatchingProposals({
          proposals: [],
          filters: {
            ...DEFAULT_PROPOSALS_FILTERS,
          },
        })
      ).toBe(false);
    });
  });

  describe("proposalActionFields", () => {
    it("should filter action fields", () => {
      const action = proposalActionData(proposalWithRewardNodeProviderAction);

      expect(Object.keys(action).join()).toEqual(
        "nodeProvider,amountE8s,rewardMode"
      );
    });

    it("should include undefined action fields", () => {
      const action = proposalActionData(proposalWithActionWithUndefined);

      expect(Object.keys(action).join()).toEqual(
        "nodeProvider,amountE8s,rewardMode"
      );
    });

    it("should return empty array if no `action`", () => {
      const proposal = {
        ...mockProposalInfo.proposal,
        action: undefined,
      } as Proposal;
      const action = proposalActionData(proposal);

      expect(Object.keys(action).length).toBe(0);
    });
  });

  describe("selectedNeuronsVotingPover", () => {
    const neuron = (id: number, votingPower: number): NeuronInfo =>
      ({
        ...mockNeuron,
        neuronId: BigInt(id),
        votingPower: BigInt(votingPower),
      }) as NeuronInfo;

    const proposalInfo = (neurons: NeuronInfo[]): ProposalInfo => ({
      ...mockProposalInfo,
      ballots: neurons.map(({ neuronId, votingPower }) => ({
        neuronId,
        votingPower: votingPower - 1n,
        vote: Vote.No,
      })),
    });

    it("should calculate total ballot voting power", () => {
      const neurons = [neuron(1, 1), neuron(2, 3), neuron(3, 5)];
      const proposal = proposalInfo(neurons);
      expect(
        selectedNeuronsVotingPower({
          neurons: neurons.map(toTestNnsVotingNode(proposal)),
          selectedIds: [1, 2, 3].map(String),
        })
      ).toBe(6n);
    });

    it("should take into account only selected neurons", () => {
      const neurons = [neuron(1, 1), neuron(2, 3), neuron(3, 5)];
      const proposal = proposalInfo(neurons);
      expect(
        selectedNeuronsVotingPower({
          neurons: neurons.map(toTestNnsVotingNode(proposal)),
          selectedIds: [1, 3].map(String),
        })
      ).toBe(4n);
    });

    it("should return 0 if no selection", () => {
      const neurons = [neuron(1, 1), neuron(2, 3), neuron(3, 5)];
      const proposal = proposalInfo(neurons);
      expect(
        selectedNeuronsVotingPower({
          neurons: neurons.map(toTestNnsVotingNode(proposal)),
          selectedIds: [],
        })
      ).toBe(0n);
    });
  });

  describe("preserveNeuronSelectionAfterUpdate", () => {
    const neuron = (id: number): NeuronInfo =>
      ({
        ...mockNeuron,
        neuronId: BigInt(id),
      }) as NeuronInfo;

    it("should preserve old selection", () => {
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [0, 1, 2].map(String),
          neurons: [neuron(0), neuron(1), neuron(2)].map(toTestNnsVotingNode()),
          updatedNeurons: [neuron(0), neuron(1), neuron(2)].map(
            toTestNnsVotingNode()
          ),
        })
      ).toEqual([0, 1, 2].map(String));
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [0, 2].map(String),
          neurons: [neuron(0), neuron(1), neuron(2)].map(toTestNnsVotingNode()),
          updatedNeurons: [neuron(0), neuron(1), neuron(2)].map(
            toTestNnsVotingNode()
          ),
        })
      ).toEqual([0, 2].map(String));
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [].map(String),
          neurons: [neuron(0), neuron(1), neuron(2)].map(toTestNnsVotingNode()),
          updatedNeurons: [neuron(0), neuron(1), neuron(2)].map(
            toTestNnsVotingNode()
          ),
        })
      ).toEqual([].map(String));
    });

    it("should select new neurons", () => {
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [].map(String),
          neurons: [neuron(0), neuron(1), neuron(2)].map(toTestNnsVotingNode()),
          updatedNeurons: [
            neuron(0),
            neuron(1),
            neuron(2),
            neuron(3),
            neuron(4),
          ].map(toTestNnsVotingNode()),
        })
      ).toEqual([3, 4].map(String));
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [0].map(String),
          neurons: [neuron(0), neuron(1)].map(toTestNnsVotingNode()),
          updatedNeurons: [neuron(0), neuron(1), neuron(2)].map(
            toTestNnsVotingNode()
          ),
        })
      ).toEqual([0, 2].map(String));
    });

    it("should remove selction from not existed anymore neurons", () => {
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [0, 1, 2].map(String),
          neurons: [neuron(0), neuron(1), neuron(2)].map(toTestNnsVotingNode()),
          updatedNeurons: [neuron(0), neuron(1)].map(toTestNnsVotingNode()),
        })
      ).toEqual([0, 1].map(String));
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [0, 1, 2].map(String),
          neurons: [neuron(0), neuron(1), neuron(2)].map(toTestNnsVotingNode()),
          updatedNeurons: [neuron(0), neuron(1), neuron(3)].map(
            toTestNnsVotingNode()
          ),
        })
      ).toEqual([0, 1, 3].map(String));
    });
  });

  describe("proposalIdSet", () => {
    it("should return a set with ids", () => {
      const proposals = generateMockProposals(10);
      const idSet = proposalIdSet([...proposals, ...proposals]);
      expect(idSet.size).toBe(proposals.length);
      expect(Array.from(idSet).sort()).toStrictEqual(
        proposals.map(({ id }) => id).sort()
      );
    });

    it("should ignore records withoug id", () => {
      const proposals = generateMockProposals(2);
      proposals[0].id = undefined;
      const idSet = proposalIdSet(proposals);
      expect(idSet.size).toBe(1);
      expect(Array.from(idSet)).toStrictEqual([1n]);
    });
  });

  describe("excludeProposals", () => {
    it("should exclude proposals", () => {
      const proposals = generateMockProposals(10);
      expect(
        excludeProposals({
          proposals: proposals,
          exclusion: proposals,
        })
      ).toEqual([]);
      expect(
        excludeProposals({
          proposals: proposals,
          exclusion: proposals.slice(5),
        })
      ).toEqual(proposals.slice(0, 5));
      expect(
        excludeProposals({
          proposals: proposals,
          exclusion: [],
        })
      ).toEqual(proposals);
      expect(
        excludeProposals({
          proposals: [],
          exclusion: proposals,
        })
      ).toEqual([]);
    });
  });

  describe("mapProposalInfo", () => {
    const now = nowInSeconds();
    const deadlineTimestampSeconds = BigInt(now + 1000000);
    const [proposalInfo] = generateMockProposals(1, {
      topic: Topic.Governance,
      status: ProposalStatus.Open,
      rewardStatus: ProposalRewardStatus.AcceptVotes,
      deadlineTimestampSeconds,
      proposer: 1_234n,
    });

    const proposal = {
      title: "test",
      url: "https://test.com",
    } as Proposal;

    it("should map proposalInfo fields", () => {
      const {
        topic,
        topicDescription,
        deadline,
        proposer,
        title,
        url,
        status,
        statusString,
        statusDescription,
        rewardStatus,
        rewardStatusString,
        rewardStatusDescription,
      } = mapProposalInfo({
        ...proposalInfo,
        proposal,
      });

      expect(topic).toEqual(en.topics.Governance);
      expect(topicDescription).toEqual(en.topics_description.Governance);
      expect(deadline).toEqual(
        deadlineTimestampSeconds - BigInt(nowInSeconds())
      );
      expect(proposer).toEqual(1_234n);
      expect(title).toEqual(proposal.title);
      expect(url).toEqual(proposal.url);

      expect(status).toEqual(proposalInfo.status);
      expect(statusString).toEqual(
        en.status[ProposalStatus[proposalInfo.status]]
      );
      expect(statusDescription).toEqual(
        en.status_description[ProposalStatus[proposalInfo.status]]
      );

      expect(rewardStatus).toEqual(proposalInfo.rewardStatus);
      expect(rewardStatusString).toEqual(
        en.rewards[ProposalRewardStatus[proposalInfo.rewardStatus]]
      );
      expect(rewardStatusDescription).toEqual(
        en.rewards_description[ProposalRewardStatus[proposalInfo.rewardStatus]]
      );
    });

    it("should map action to undefined", () => {
      const { type, typeDescription } = mapProposalInfo({
        ...proposalInfo,
        proposal,
      });

      expect(type).toBeUndefined();
      expect(typeDescription).toBeUndefined();
    });

    it("should map action to type", () => {
      const { type, typeDescription } = mapProposalInfo({
        ...proposalInfo,
        proposal: {
          ...proposal,
          action: { RegisterKnownNeuron: {} as KnownNeuron },
        },
      });

      expect(en.actions.RegisterKnownNeuron).toEqual(type);
      expect(en.actions_description.RegisterKnownNeuron).toEqual(
        typeDescription
      );
    });

    it("should map nns function to type", () => {
      const { type, typeDescription } = mapProposalInfo({
        ...proposalInfo,
        proposal: {
          ...proposal,
          action: {
            ExecuteNnsFunction: { nnsFunctionId: 3 } as ExecuteNnsFunction,
          },
        },
      });

      expect(en.nns_functions.NnsCanisterInstall).toEqual(type);
      expect(en.nns_functions_description.NnsCanisterInstall).toEqual(
        typeDescription
      );
    });

    it("should provide labels for all function IDs", () => {
      const IGNORED_NNS_FUNCTION_IDS = [
        NnsFunction.HardResetNnsRootToVersion,
        // Obsolete types
        NnsFunction.BlessReplicaVersion,
        NnsFunction.RetireReplicaVersion,
        NnsFunction.UpdateApiBoundaryNodeDomain,
        NnsFunction.UpdateApiBoundaryNodesVersion,
      ];
      const proposalWithNnsFunctionId = (nnsFunctionId: number) => ({
        ...proposalInfo,
        proposal: {
          ...proposal,
          action: {
            ExecuteNnsFunction: { nnsFunctionId } as ExecuteNnsFunction,
          },
        },
      });
      const typeSet = new Set();
      const typeDescriptionSet = new Set();

      for (const nnsFunctionId of enumValues(NnsFunction)) {
        if (IGNORED_NNS_FUNCTION_IDS.includes(nnsFunctionId)) {
          continue;
        }
        const { type, typeDescription } = mapProposalInfo(
          proposalWithNnsFunctionId(nnsFunctionId)
        );

        // Labels should be defined
        expect(type).toBeDefined();
        expect(typeDescription).toBeDefined();

        // Labels should be unique
        expect(typeSet.has(type)).toBe(false);
        expect(typeDescriptionSet.has(typeDescription)).toBe(false);

        typeSet.add(type);
        typeDescriptionSet.add(typeDescription);
      }
    });
  });

  describe("concatenateUniqueProposals", () => {
    it("should concatenate proposals", () => {
      const proposals = generateMockProposals(10);
      const result = concatenateUniqueProposals({
        oldProposals: proposals.slice(0, 5),
        newProposals: proposals.slice(5),
      });
      expect(result).toEqual(proposals);
    });

    it("should concatenate only unique proposals", () => {
      const proposals = generateMockProposals(10);
      const result = concatenateUniqueProposals({
        oldProposals: proposals.slice(0, 5),
        newProposals: proposals,
      });
      expect(result).toEqual(proposals);
    });
  });

  describe("replaceAndConcatenateProposals", () => {
    const proposalsA = generateMockProposals(10, {
      proposalTimestampSeconds: 0n,
    });
    const proposalsB = generateMockProposals(10, {
      proposalTimestampSeconds: 0n,
    });

    it("should replace proposals by id", () => {
      const result = replaceAndConcatenateProposals({
        oldProposals: proposalsA,
        newProposals: proposalsB,
      });
      expect(result).toStrictEqual(proposalsB);
    });

    it("should concatinate proposals", () => {
      const result = replaceAndConcatenateProposals({
        oldProposals: [],
        newProposals: proposalsB,
      });
      expect(result).toStrictEqual(proposalsB);
    });

    it("should replace and concatinate", () => {
      const oldProposals = proposalsA.slice(5);
      const newProposals = proposalsB.slice(0, 5);
      const result = replaceAndConcatenateProposals({
        oldProposals,
        newProposals,
      });
      expect(result).toStrictEqual([...oldProposals, ...newProposals]);
    });
  });

  describe("proposalsHaveSameIds", () => {
    const proposals = generateMockProposals(10);

    it("should comprare", () => {
      expect(
        proposalsHaveSameIds({ proposalsA: [], proposalsB: [] })
      ).toBeTruthy();
      expect(
        proposalsHaveSameIds({
          proposalsA: proposals,
          proposalsB: proposals.slice(0),
        })
      ).toBeTruthy();
      expect(
        proposalsHaveSameIds({
          proposalsA: proposals,
          proposalsB: proposals.slice(1),
        })
      ).toBe(false);
      expect(
        proposalsHaveSameIds({
          proposalsA: generateMockProposals(20).slice(10),
          proposalsB: proposals,
        })
      ).toBe(false);
    });
  });

  describe("replaceProposals", () => {
    const oldProposals = generateMockProposals(10, {
      proposalTimestampSeconds: 1n,
    });
    const newProposals = generateMockProposals(10, {
      proposalTimestampSeconds: 2n,
    });

    it("should replace proposals", () => {
      expect(
        replaceProposals({
          oldProposals,
          newProposals,
        })
      ).toEqual(newProposals);
    });

    it("should not remove existent proposals", () => {
      expect(
        replaceProposals({
          oldProposals,
          newProposals: newProposals.slice(5),
        })
      ).toEqual([...oldProposals.slice(0, 5), ...newProposals.slice(5)]);
    });

    it("should not add new proposals", () => {
      expect(
        replaceProposals({
          oldProposals: [],
          newProposals,
        })
      ).toEqual([]);
    });
  });

  describe("getVotingBallot", () => {
    it("should return ballot of neuron if present", () => {
      const neuronId = 100n;
      const ballot: Ballot = {
        neuronId,
        votingPower: 30n,
        vote: Vote.Yes,
      };
      const proposal = {
        ...mockProposalInfo,
        ballots: [ballot],
      };
      expect(
        getVotingBallot({
          neuronId,
          proposalInfo: proposal,
        })
      ).toEqual(ballot);
    });

    it("should return undefined if ballot not present", () => {
      const neuronId = 100n;
      const ballot: Ballot = {
        neuronId: 400n,
        votingPower: 30n,
        vote: Vote.Yes,
      };
      const proposal = {
        ...mockProposalInfo,
        ballots: [ballot],
      };
      expect(
        getVotingBallot({
          neuronId,
          proposalInfo: proposal,
        })
      ).toBeUndefined();
    });
  });

  describe("getVotingPower", () => {
    it("should return ballot voting power if present", () => {
      const neuronId = 100n;
      const neuron = {
        ...mockNeuron,
        neuronId,
      };
      const ballot: Ballot = {
        neuronId,
        votingPower: 30n,
        vote: Vote.Yes,
      };
      const proposal = {
        ...mockProposalInfo,
        ballots: [ballot],
      };
      expect(
        getVotingPower({
          neuron,
          proposal,
        })
      ).toEqual(ballot.votingPower);
    });

    it("should return neuron voting power if no ballot", () => {
      const decidingVotingPower = 123_000_000n;
      const proposal = {
        ...mockProposalInfo,
        ballots: [],
      };
      expect(
        getVotingPower({
          neuron: {
            ...mockNeuron,
            decidingVotingPower,
          },
          proposal,
        })
      ).toBe(decidingVotingPower);
    });
  });

  describe("getNnsFunctionKey", () => {
    it("should return nnsFunctionKey from proposal", () => {
      expect(
        getNnsFunctionKey({
          ...mockProposalInfo.proposal,
          action: {
            ExecuteNnsFunction: {
              nnsFunctionId: 4,
            },
          },
        } as Proposal)
      ).toBe(NnsFunction[NnsFunction.NnsCanisterUpgrade]);
    });

    it("should return undefined if not ExecuteNnsFunction type", () => {
      expect(
        getNnsFunctionKey({
          ...mockProposalInfo.proposal,
          action: {},
        } as Proposal)
      ).toBeUndefined();
    });

    it("should return undefined if undefined", () => {
      expect(getNnsFunctionKey(undefined)).toBeUndefined();
    });
  });

  describe("Open for votes", () => {
    it("should be open for votes", () => {
      const nowSeconds = new Date().getTime() / 1000;
      expect(
        isProposalDeadlineInTheFuture({
          ...mockProposalInfo,
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds + 10000)),
        })
      ).toBeTruthy();
    });

    it("should not be open for votes", () => {
      const nowSeconds = new Date().getTime() / 1000;
      expect(
        isProposalDeadlineInTheFuture({
          ...mockProposalInfo,
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds - 10000)),
        })
      ).toBe(false);
    });

    it("should be open for votes short period", () => {
      const nowSeconds = new Date().getTime() / 1000;
      expect(
        isProposalDeadlineInTheFuture({
          ...mockProposalInfo,
          deadlineTimestampSeconds: undefined,
          topic: Topic.NeuronManagement,
          proposalTimestampSeconds: BigInt(Math.round(nowSeconds - 3600)),
        })
      ).toBeTruthy();
    });

    it("should not be open for votes short period", () => {
      const nowSeconds = new Date().getTime() / 1000;
      expect(
        isProposalDeadlineInTheFuture({
          ...mockProposalInfo,
          deadlineTimestampSeconds: undefined,
          topic: Topic.NeuronManagement,
          proposalTimestampSeconds: BigInt(Math.round(nowSeconds - 3600 * 13)),
        })
      ).toBe(false);
    });

    it("should be open for votes quiet threshold", () => {
      const nowSeconds = new Date().getTime() / 1000;
      expect(
        isProposalDeadlineInTheFuture({
          ...mockProposalInfo,
          deadlineTimestampSeconds: undefined,
          topic: Topic.Governance,
          proposalTimestampSeconds: BigInt(Math.round(nowSeconds - 3600)),
        })
      ).toBeTruthy();

      expect(
        isProposalDeadlineInTheFuture({
          ...mockProposalInfo,
          deadlineTimestampSeconds: undefined,
          topic: Topic.Governance,
          proposalTimestampSeconds: BigInt(Math.round(nowSeconds - 3600 * 13)),
        })
      ).toBeTruthy();

      expect(
        isProposalDeadlineInTheFuture({
          ...mockProposalInfo,
          deadlineTimestampSeconds: undefined,
          topic: Topic.Governance,
          proposalTimestampSeconds: BigInt(
            Math.round(nowSeconds - 3600 * 24 * 3)
          ),
        })
      ).toBeTruthy();
    });

    it("should not be open for votes quiet threshold", () => {
      const nowSeconds = new Date().getTime() / 1000;
      expect(
        isProposalDeadlineInTheFuture({
          ...mockProposalInfo,
          deadlineTimestampSeconds: undefined,
          topic: Topic.Governance,
          proposalTimestampSeconds: BigInt(
            Math.round(nowSeconds - 3600 * 24 * 5)
          ),
        })
      ).toBe(false);
    });
  });

  describe("nnsNeuronToVotingNeuron", () => {
    it("should generate VotingNeuron from NeuronInfo", () => {
      const neuronId = 100n;
      const neuron = {
        ...mockNeuron,
        neuronId,
        votingPower: 0n,
      };
      const votingPower = 123_456_789n;
      const ballot: Ballot = {
        neuronId,
        votingPower,
        vote: Vote.Yes,
      };
      const proposal = {
        ...mockProposalInfo,
        ballots: [ballot],
      };

      expect(
        nnsNeuronToVotingNeuron({
          neuron,
          proposal,
        })
      ).toEqual({
        neuronIdString: `${neuronId}`,
        votingPower: votingPower,
      });
    });
  });

  describe("getUniversalProposalStatus", () => {
    it("should return UniversalProposalStatus", () => {
      const proposalWithStatus = (status: ProposalStatus): ProposalInfo => ({
        ...mockProposalInfo,
        status,
      });

      expect(
        getUniversalProposalStatus(proposalWithStatus(ProposalStatus.Unknown))
      ).toBe("unknown");
      expect(
        getUniversalProposalStatus(proposalWithStatus(ProposalStatus.Open))
      ).toBe("open");
      expect(
        getUniversalProposalStatus(proposalWithStatus(ProposalStatus.Rejected))
      ).toBe("rejected");
      expect(
        getUniversalProposalStatus(proposalWithStatus(ProposalStatus.Accepted))
      ).toBe("adopted");
      expect(
        getUniversalProposalStatus(proposalWithStatus(ProposalStatus.Failed))
      ).toBe("failed");
    });
  });

  describe("getVoteDisplay", () => {
    it("should render vote", () => {
      expect(getVoteDisplay(Vote.Yes)).toBe("Yes");
      expect(getVoteDisplay(Vote.No)).toBe("No");
      expect(getVoteDisplay(Vote.Unspecified)).toBe("Unspecified");
    });
  });

  describe("navigationIdComparator", () => {
    const universeA = "aaaaa-aaaaa";
    const universeB = "bbbbb-bbbbb";
    const universes = [universeA, universeB];

    it("should compare by universes", () => {
      expect(
        navigationIdComparator({
          a: {
            universe: universeA,
            proposalId: 1n,
          },
          b: {
            universe: universeB,
            proposalId: 1n,
          },
          universes,
        })
      ).toBe(-1);
      expect(
        navigationIdComparator({
          a: {
            universe: universeB,
            proposalId: 1n,
          },
          b: {
            universe: universeA,
            proposalId: 1n,
          },
          universes,
        })
      ).toBe(1);
    });

    it("should compare by proposal IDs", () => {
      expect(
        navigationIdComparator({
          a: {
            universe: universeA,
            proposalId: 0n,
          },
          b: {
            universe: universeA,
            proposalId: 1n,
          },
          universes,
        })
      ).toBe(1);
      expect(
        navigationIdComparator({
          a: {
            universe: universeA,
            proposalId: 1n,
          },
          b: {
            universe: universeA,
            proposalId: 0n,
          },
          universes,
        })
      ).toBe(-1);
    });

    it("should return 0 when a = b", () => {
      expect(
        navigationIdComparator({
          a: {
            universe: universeA,
            proposalId: 1n,
          },
          b: {
            universe: universeA,
            proposalId: 1n,
          },
          universes,
        })
      ).toBe(0);
    });
  });

  describe("sortProposalsByIdDescendingOrder", () => {
    const proposal0 = { ...mockProposalInfo, id: 0n } as ProposalInfo;
    const proposal1 = { ...mockProposalInfo, id: 1n } as ProposalInfo;
    const proposal2 = { ...mockProposalInfo, id: 2n } as ProposalInfo;

    it("should sort proposals", () => {
      expect(
        sortProposalsByIdDescendingOrder([proposal1, proposal0, proposal2])
      ).toEqual([proposal2, proposal1, proposal0]);
      expect(
        sortProposalsByIdDescendingOrder([proposal2, proposal1, proposal0])
      ).toEqual([proposal2, proposal1, proposal0]);
      expect(sortProposalsByIdDescendingOrder([proposal0])).toEqual([
        proposal0,
      ]);
      expect(sortProposalsByIdDescendingOrder([])).toEqual([]);
    });
  });
});
