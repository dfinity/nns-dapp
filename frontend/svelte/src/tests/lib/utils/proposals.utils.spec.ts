import { Ballot, Proposal, Vote } from "@dfinity/nns";
import {
  emptyProposals,
  formatVotingPower,
  hasMatchingProposals,
  hideProposal,
  lastProposalId,
  proposalActionFields,
  proposalFirstActionKey,
} from "../../../lib/utils/proposals.utils";
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
        "nnsFunctionId,nnsFunctionName,payload"
      );
    });
  });

  describe("formatVotingPower", () => {
    it("should format", () => {
      expect(formatVotingPower(BigInt(0))).toBe("0.00");
      expect(formatVotingPower(BigInt(100000000))).toBe("1.00");
      expect(formatVotingPower(BigInt(9999900000))).toBe("100.00");
    });
  });
});
