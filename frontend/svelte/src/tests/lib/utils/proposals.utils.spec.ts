import type { Ballot, NeuronInfo, Proposal } from "@dfinity/nns";
import { Vote } from "@dfinity/nns";
import {
  concatenateUniqueProposals,
  emptyProposals,
  excludeProposals,
  hasMatchingProposals,
  hideProposal,
  lastProposalId,
  preserveNeuronSelectionAfterUpdate,
  proposalActionFields,
  proposalFirstActionKey,
  proposalIdSet,
  proposalsHaveSameIds,
  replaceAndConcatenateProposals,
  replaceProposals,
  selectedNeuronsVotingPower,
} from "../../../lib/utils/proposals.utils";
import { mockNeuron } from "../../mocks/neurons.mock";
import {
  generateMockProposals,
  mockProposalInfo,
} from "../../mocks/proposal.mock";
import { mockProposals } from "../../mocks/proposals.store.mock";

describe("proposals-utils", () => {
  it("should detect an empty list of proposals", () =>
    expect(emptyProposals([])).toBeTruthy());

  it("should detect an not empty list of proposals", () =>
    expect(emptyProposals(mockProposals)).toBeFalsy());

  it("should find no last proposal id", () =>
    expect(lastProposalId([])).toBeUndefined());

  it("should find fist action key", () =>
    expect(
      proposalFirstActionKey(mockProposalInfo.proposal as Proposal)
    ).toEqual("ExecuteNnsFunction"));

  it("should display proposal", () => {
    expect(
      hideProposal({
        proposalInfo: mockProposals[0],
        excludeVotedProposals: false,
      })
    ).toBeFalsy();

    expect(
      hideProposal({
        proposalInfo: mockProposals[1],
        excludeVotedProposals: false,
      })
    ).toBeFalsy();

    expect(
      hideProposal({
        proposalInfo: mockProposals[0],
        excludeVotedProposals: true,
      })
    ).toBeFalsy();

    expect(
      hideProposal({
        proposalInfo: mockProposals[1],
        excludeVotedProposals: true,
      })
    ).toBeFalsy();

    expect(
      hideProposal({
        proposalInfo: {
          ...mockProposals[0],
          ballots: [
            {
              vote: Vote.UNSPECIFIED,
            } as Ballot,
          ],
        },
        excludeVotedProposals: false,
      })
    ).toBeFalsy();

    expect(
      hideProposal({
        proposalInfo: {
          ...mockProposals[1],
          ballots: [
            {
              vote: Vote.UNSPECIFIED,
            } as Ballot,
          ],
        },
        excludeVotedProposals: false,
      })
    ).toBeFalsy();

    expect(
      hideProposal({
        proposalInfo: {
          ...mockProposals[0],
          ballots: [
            {
              vote: Vote.UNSPECIFIED,
            } as Ballot,
          ],
        },
        excludeVotedProposals: true,
      })
    ).toBeFalsy();

    expect(
      hideProposal({
        proposalInfo: {
          ...mockProposals[1],
          ballots: [
            {
              vote: Vote.UNSPECIFIED,
            } as Ballot,
          ],
        },
        excludeVotedProposals: true,
      })
    ).toBeFalsy();
  });

  it("should hide proposal", () => {
    expect(
      hideProposal({
        proposalInfo: {
          ...mockProposals[0],
          ballots: [
            {
              vote: Vote.YES,
            } as Ballot,
          ],
        },
        excludeVotedProposals: true,
      })
    ).toBeTruthy();

    expect(
      hideProposal({
        proposalInfo: {
          ...mockProposals[0],
          ballots: [
            {
              vote: Vote.NO,
            } as Ballot,
          ],
        },
        excludeVotedProposals: true,
      })
    ).toBeTruthy();
  });

  it("should show proposal without ballots", () => {
    expect(
      hideProposal({
        proposalInfo: {
          ...mockProposals[0],
          ballots: [],
        },
        excludeVotedProposals: true,
      })
    ).toBeFalsy();
    expect(
      hideProposal({
        proposalInfo: {
          ...mockProposals[0],
          ballots: [
            {
              vote: Vote.UNSPECIFIED,
            } as Ballot,
          ],
        },
        excludeVotedProposals: true,
      })
    ).toBeFalsy();
  });

  it("should have matching proposals", () => {
    expect(
      hasMatchingProposals({
        proposals: mockProposals,
        excludeVotedProposals: false,
      })
    ).toBeTruthy();

    expect(
      hasMatchingProposals({
        proposals: mockProposals,
        excludeVotedProposals: true,
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
                vote: Vote.UNSPECIFIED,
              } as Ballot,
            ],
          },
        ],
        excludeVotedProposals: false,
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
                vote: Vote.UNSPECIFIED,
              } as Ballot,
            ],
          },
        ],
        excludeVotedProposals: false,
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
                vote: Vote.UNSPECIFIED,
              } as Ballot,
            ],
          },
        ],
        excludeVotedProposals: true,
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
                vote: Vote.UNSPECIFIED,
              } as Ballot,
            ],
          },
        ],
        excludeVotedProposals: true,
      })
    ).toBeTruthy();
  });

  it("should not have matching proposals", () => {
    expect(
      hasMatchingProposals({
        proposals: [],
        excludeVotedProposals: false,
      })
    ).toBeFalsy();

    expect(
      hasMatchingProposals({
        proposals: [
          {
            ...mockProposals[0],
            ballots: [
              {
                vote: Vote.YES,
              } as Ballot,
            ],
          },
        ],
        excludeVotedProposals: true,
      })
    ).toBeFalsy();

    expect(
      hasMatchingProposals({
        proposals: [
          {
            ...mockProposals[0],
            ballots: [
              {
                vote: Vote.NO,
              } as Ballot,
            ],
          },
        ],
        excludeVotedProposals: true,
      })
    ).toBeFalsy();
  });

  describe("proposalActionFields", () => {
    it("should filter action fields", () => {
      const fields = proposalActionFields(
        mockProposalInfo.proposal as Proposal
      );

      expect(fields.map(([key]) => key).join()).toEqual(
        "nnsFunctionId,nodeProvider,nnsFunctionName,payload"
      );
    });

    it("should return empty array if no `action`", () => {
      const proposal = {
        ...mockProposalInfo.proposal,
        action: undefined,
      } as Proposal;
      const fields = proposalActionFields(proposal);

      expect(fields.length).toBe(0);
    });

    it("should stringify all objects", () => {
      const fields = proposalActionFields(
        mockProposalInfo.proposal as Proposal
      );
      const asText = fields.map((fields) => fields.join()).join();

      expect(/\[object Object\]/.test(asText)).toBeFalsy();
    });

    it("should simulate flutter dapp formatting (temp solution)", () => {
      const fields = proposalActionFields(
        mockProposalInfo.proposal as Proposal
      );
      expect(fields[0][0]).toBe("nnsFunctionId");
      expect(fields[0][1]).toBe("4");
      expect(fields[2][0]).toBe("nnsFunctionName");
      expect(fields[2][1]).toBe("nnsFunctionValue");
    });
  });

  describe("selectedNeuronsVotingPover", () => {
    const neuron = (id: number, votingPower: number): NeuronInfo =>
      ({
        ...mockNeuron,
        neuronId: BigInt(id),
        votingPower: BigInt(votingPower),
      } as NeuronInfo);

    it("should calculate total", () => {
      expect(
        selectedNeuronsVotingPower({
          neurons: [neuron(1, 1), neuron(2, 3), neuron(3, 5)],
          selectedIds: [1, 2, 3].map(BigInt),
        })
      ).toBe(BigInt(9));

      expect(
        selectedNeuronsVotingPower({
          neurons: [neuron(1, 1), neuron(2, 3), neuron(3, 5)],
          selectedIds: [1, 3].map(BigInt),
        })
      ).toBe(BigInt(6));
    });

    it("should return 0 if no selection", () => {
      expect(
        selectedNeuronsVotingPower({
          neurons: [neuron(1, 1), neuron(2, 3), neuron(3, 5)],
          selectedIds: [],
        })
      ).toBe(BigInt(0));
    });
  });

  describe("preserveNeuronSelectionAfterUpdate", () => {
    const neuron = (id: number): NeuronInfo =>
      ({
        ...mockNeuron,
        neuronId: BigInt(id),
      } as NeuronInfo);

    it("should preserve old selection", () => {
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [0, 1, 2].map(BigInt),
          neurons: [neuron(0), neuron(1), neuron(2)],
          updatedNeurons: [neuron(0), neuron(1), neuron(2)],
        })
      ).toEqual([0, 1, 2].map(BigInt));
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [0, 2].map(BigInt),
          neurons: [neuron(0), neuron(1), neuron(2)],
          updatedNeurons: [neuron(0), neuron(1), neuron(2)],
        })
      ).toEqual([0, 2].map(BigInt));
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [].map(BigInt),
          neurons: [neuron(0), neuron(1), neuron(2)],
          updatedNeurons: [neuron(0), neuron(1), neuron(2)],
        })
      ).toEqual([].map(BigInt));
    });

    it("should select new neurons", () => {
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [].map(BigInt),
          neurons: [neuron(0), neuron(1), neuron(2)],
          updatedNeurons: [
            neuron(0),
            neuron(1),
            neuron(2),
            neuron(3),
            neuron(4),
          ],
        })
      ).toEqual([3, 4].map(BigInt));
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [0].map(BigInt),
          neurons: [neuron(0), neuron(1)],
          updatedNeurons: [neuron(0), neuron(1), neuron(2)],
        })
      ).toEqual([0, 2].map(BigInt));
    });

    it("should remove selction from not existed anymore neurons", () => {
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [0, 1, 2].map(BigInt),
          neurons: [neuron(0), neuron(1), neuron(2)],
          updatedNeurons: [neuron(0), neuron(1)],
        })
      ).toEqual([0, 1].map(BigInt));
      expect(
        preserveNeuronSelectionAfterUpdate({
          selectedIds: [0, 1, 2].map(BigInt),
          neurons: [neuron(0), neuron(1), neuron(2)],
          updatedNeurons: [neuron(0), neuron(1), neuron(3)],
        })
      ).toEqual([0, 1, 3].map(BigInt));
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
      expect(Array.from(idSet)).toStrictEqual([BigInt(1)]);
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

  describe("concatenateUniqueProposals", () => {
    it("should concatinate proposals", () => {
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
      proposalTimestampSeconds: BigInt(0),
    });
    const proposalsB = generateMockProposals(10, {
      proposalTimestampSeconds: BigInt(0),
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
      ).toBeFalsy();
      expect(
        proposalsHaveSameIds({
          proposalsA: generateMockProposals(20).slice(10),
          proposalsB: proposals,
        })
      ).toBeFalsy();
    });
  });

  describe("replaceProposals", () => {
    const oldProposals = generateMockProposals(10, {
      proposalTimestampSeconds: BigInt(1),
    });
    const newProposals = generateMockProposals(10, {
      proposalTimestampSeconds: BigInt(2),
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
});
