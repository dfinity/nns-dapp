import type { ProposalInfo } from "@dfinity/nns";
import {
  emptyProposals,
  lastProposalId,
} from "../../../lib/utils/proposals.utils";

describe("proposals-utils", () => {
  const mockProposals: ProposalInfo[] = [
    {
      id: "test1",
    },
    { id: "test2" },
  ] as unknown as ProposalInfo[];

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
});
