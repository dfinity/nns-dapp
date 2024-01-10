import { sortedProposals } from "$lib/derived/proposals.derived";
import { proposalsStore } from "$lib/stores/proposals.store";
import type { ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";

describe("proposals-derived", () => {
  it("should derives and sort proposals store", () => {
    const storeProposals = [
      {
        id: 3n,
      },
      {
        id: 10n,
      },
      {
        id: 5n,
      },
      {
        id: 1n,
      },
    ];

    const expectedProposals = [
      {
        id: 10n,
      },
      {
        id: 5n,
      },
      {
        id: 3n,
      },
      {
        id: 1n,
      },
    ];

    proposalsStore.setProposals({
      proposals: storeProposals as ProposalInfo[],
      certified: true,
    });

    const { proposals } = get(sortedProposals);
    expect(proposals).toEqual(expectedProposals);
  });
});
