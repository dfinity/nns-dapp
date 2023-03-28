import { loadSnsFilters } from "$lib/services/sns-filters.services";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { enumSize } from "$lib/utils/enum.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { SnsProposalDecisionStatus } from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns-filters services", () => {
  describe("loadSnsFilters", () => {
    afterEach(() => {
      snsFiltersStore.reset();
    });
    it("should load the sns filters store with status but not Unspecified", async () => {
      await loadSnsFilters(mockPrincipal);

      const projectStore = get(snsFiltersStore)[mockPrincipal.toText()];

      expect(projectStore.decisionStatus).toHaveLength(
        enumSize(SnsProposalDecisionStatus) - 1
      );
      expect(
        projectStore.decisionStatus.map(({ value }) => value)
      ).not.toContainEqual(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_UNSPECIFIED
      );
    });

    it("should not change filters if they are already present", async () => {
      const decisionStatus = [];
      snsFiltersStore.setDecisionStatus({
        rootCanisterId: mockPrincipal,
        decisionStatus,
      });

      await loadSnsFilters(mockPrincipal);

      const projectStore = get(snsFiltersStore)[mockPrincipal.toText()];
      expect(projectStore.decisionStatus).toHaveLength(decisionStatus.length);
    });
  });
});
