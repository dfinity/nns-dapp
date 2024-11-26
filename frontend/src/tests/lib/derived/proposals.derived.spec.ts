import {
  filteredActionableProposals,
  sortedProposals,
} from "$lib/derived/proposals.derived";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import {
  proposalsFiltersStore,
  proposalsStore,
} from "$lib/stores/proposals.store";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
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

    proposalsStore.setProposalsForTesting({
      proposals: storeProposals as ProposalInfo[],
      certified: true,
    });

    const { proposals } = get(sortedProposals);
    expect(proposals).toEqual(expectedProposals);
  });

  describe("filteredActionableProposals", () => {
    beforeEach(() => {
      proposalsStore.resetForTesting();
      proposalsFiltersStore.reset();
    });

    it("should append isActionable", () => {
      proposalsStore.setProposalsForTesting({
        proposals: [...mockProposals],
        certified: true,
      });
      actionableNnsProposalsStore.setProposals([mockProposals[0]]);

      expect(get(filteredActionableProposals)?.proposals).toHaveLength(
        mockProposals.length
      );
      expect(get(filteredActionableProposals)).toEqual({
        proposals: [
          {
            ...mockProposals[0],
            hidden: false,
            isActionable: true,
          },
          {
            ...mockProposals[1],
            hidden: false,
            isActionable: false,
          },
        ],
        certified: true,
      });
    });

    it("should add isActionable=undefined when actionables not available", () => {
      proposalsStore.setProposalsForTesting({
        proposals: [...mockProposals],
        certified: true,
      });

      expect(get(filteredActionableProposals)).toEqual({
        proposals: [
          {
            ...mockProposals[0],
            hidden: false,
            isActionable: undefined,
          },
          {
            ...mockProposals[1],
            hidden: false,
            isActionable: undefined,
          },
        ],
        certified: true,
      });
    });
  });
});
