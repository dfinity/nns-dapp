import { Ballot, Vote } from "@dfinity/nns";
import {
  emptyProposals,
  hideProposal,
  lastProposalId,
} from "../../../lib/utils/proposals.utils";
import { mockProposals } from "../../mocks/proposals.store.mock";

describe("proposals-utils", () => {
  it("should detect an empty list of proposals", () =>
    expect(emptyProposals([])).toBeTruthy());

  it("should detect an not empty list of proposals", () =>
    expect(emptyProposals(mockProposals)).toBeFalsy());

  it("should find no last proposal id", () =>
    expect(lastProposalId([])).toBeUndefined());

  it("should find a last proposal id", () =>
    expect(lastProposalId(mockProposals)).toEqual(
      mockProposals[mockProposals.length - 1].id
    ));

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
});
