import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import { get } from "svelte/store";

describe("actionable proposals segment store", () => {
  beforeEach(() => {
    actionableProposalsSegmentStore.resetForTesting();
  });

  it('should have "all" by default ', () => {
    expect(get(actionableProposalsSegmentStore).selected).toEqual("all");
  });

  it("should set selected", () => {
    actionableProposalsSegmentStore.set("actionable");
    expect(get(actionableProposalsSegmentStore).selected).toEqual("actionable");

    actionableProposalsSegmentStore.set("all");
    expect(get(actionableProposalsSegmentStore).selected).toEqual("all");
  });
});
