import type { ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import { sortedProposals } from "../../../lib/derived/proposals.derived";
import { proposalsStore } from "../../../lib/stores/proposals.store";

describe("proposals-derived", () => {
  it("should derives and sort proposals store", () => {
    const storeProposals = [
      {
        id: BigInt(3),
      },
      {
        id: BigInt(10),
      },
      {
        id: BigInt(5),
      },
      {
        id: BigInt(1),
      },
    ];

    const expectedProposals = [
      {
        id: BigInt(10),
      },
      {
        id: BigInt(5),
      },
      {
        id: BigInt(3),
      },
      {
        id: BigInt(1),
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
