import type { ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import { DEFAULT_PROPOSALS_FILTERS } from "../../../lib/constants/proposals.constants";
import {
  proposalsFiltersStore,
  proposalsStore,
} from "../../../lib/stores/proposals.store";

describe("proposals-store", () => {
  describe("proposals", () => {
    const mockProposals: ProposalInfo[] = [
      {
        id: "test1",
      },
      { id: "test2" },
    ] as unknown as ProposalInfo[];

    it("should set proposals", () => {
      proposalsStore.setProposals(mockProposals);

      const proposals = get(proposalsStore);
      expect(proposals).toEqual(mockProposals);
    });

    it("should push proposals", () => {
      proposalsStore.setProposals(mockProposals);

      proposalsStore.pushProposals(mockProposals);

      const proposals = get(proposalsStore);
      expect(proposals).toEqual([...mockProposals, ...mockProposals]);
    });

    it("should reset proposals", () => {
      proposalsStore.setProposals(mockProposals);
      proposalsStore.setProposals([]);

      const proposals = get(proposalsStore);
      expect(proposals).toEqual([]);
    });
  });

  describe("filter", () => {
    it("should be initialized with default filters", () => {
      const filters = get(proposalsFiltersStore);
      expect(filters).toEqual(DEFAULT_PROPOSALS_FILTERS);
    });
  });
});
