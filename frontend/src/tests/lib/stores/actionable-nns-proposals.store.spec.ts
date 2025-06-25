import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { get } from "svelte/store";

describe("actionable Nns proposals store", () => {
  it("should push proposal", () => {
    actionableNnsProposalsStore.setProposals([mockProposalInfo]);
    expect(get(actionableNnsProposalsStore)).toEqual({
      proposals: [mockProposalInfo],
      fetchLimitReached: false,
    });
  });

  it("should reset proposals", () => {
    actionableNnsProposalsStore.setProposals([mockProposalInfo]);
    expect(get(actionableNnsProposalsStore)).toEqual({
      proposals: [mockProposalInfo],
      fetchLimitReached: false,
    });
    actionableNnsProposalsStore.reset();
    expect(get(actionableNnsProposalsStore).proposals).toEqual(undefined);
  });

  it("should set if the fetch limit was reached", () => {
    actionableNnsProposalsStore.setProposals([mockProposalInfo]);
    actionableNnsProposalsStore.setFetchLimitReached(true);
    expect(get(actionableNnsProposalsStore)).toEqual({
      proposals: [mockProposalInfo],
      fetchLimitReached: true,
    });
    actionableNnsProposalsStore.setFetchLimitReached(false);
    expect(get(actionableNnsProposalsStore)).toEqual({
      proposals: [mockProposalInfo],
      fetchLimitReached: false,
    });
    actionableNnsProposalsStore.reset();
    expect(get(actionableNnsProposalsStore).proposals).toEqual(undefined);
  });
});
