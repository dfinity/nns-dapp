import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { get } from "svelte/store";

describe("actionable Nns proposals store", () => {
  it("should push proposal", () => {
    actionableNnsProposalsStore.setProposals([mockProposalInfo]);
    expect(get(actionableNnsProposalsStore).proposals).toEqual([
      mockProposalInfo,
    ]);
  });

  it("should reset proposals", () => {
    actionableNnsProposalsStore.setProposals([mockProposalInfo]);
    expect(get(actionableNnsProposalsStore).proposals).toEqual([
      mockProposalInfo,
    ]);
    actionableNnsProposalsStore.reset();
    expect(get(actionableNnsProposalsStore).proposals).toEqual(undefined);
  });
});
