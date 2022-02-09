import type { ProposalInfo } from "../../../../../../../nns-js/src";
import { proposalsStore } from "../../../lib/stores/proposals.store";
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
    expect(emptyProposals()).toBeTruthy());

  it("should detect an not empty list of proposals", () => {
    proposalsStore.setProposals(mockProposals);

    expect(emptyProposals()).toBeFalsy();

    proposalsStore.setProposals([]);
  });

  it("should find no last proposal id", () =>
    expect(lastProposalId()).toBeUndefined());

  it("should find a last proposal id", () => {
    proposalsStore.setProposals(mockProposals);

    expect(lastProposalId()).toEqual(
      mockProposals[mockProposals.length - 1].id
    );

    proposalsStore.setProposals([]);
  });
});
