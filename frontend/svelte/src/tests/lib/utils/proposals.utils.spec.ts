import type { Ballot, NeuronInfo, Proposal } from "@dfinity/nns";
import { Vote } from "@dfinity/nns";
import {
  emptyProposals,
  formatVotingPower,
  hasMatchingProposals,
  hideProposal,
  lastProposalId,
  proposalActionFields,
  proposalFirstActionKey,
  selectedNeuronsVotingPower,
} from "../../../lib/utils/proposals.utils";
import { mockNeuron } from "../../mocks/neurons.mock";
import { mockProposalInfo } from "../../mocks/proposal.mock";
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

  describe("formatVotingPower", () => {
    it("should format", () => {
      expect(formatVotingPower(BigInt(0))).toBe("0.00");
      expect(formatVotingPower(BigInt(100000000))).toBe("1.00");
      expect(formatVotingPower(BigInt(9999900000))).toBe("100.00");
    });
  });

  describe("selectedNeuronsVotingPower", () => {
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
});
