import { loadSnsFilters } from "$lib/services/sns-filters.services";
import { snsFiltesStore } from "$lib/stores/sns-filters.store";
import { enumSize } from "$lib/utils/enum.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { SnsProposalDecisionStatus } from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns-filters services", () => {
  describe("loadSnsFilters", () => {
    afterEach(() => {
      snsFiltesStore.reset();
    });
    it("should load the sns filters store with status but not Unspecified", async () => {
      await loadSnsFilters(mockPrincipal);

      const projectStore = get(snsFiltesStore)[mockPrincipal.toText()];

      expect(projectStore.decisionStatus).toHaveLength(
        enumSize(SnsProposalDecisionStatus) - 1
      );
      expect(
        projectStore.decisionStatus.map(({ value }) => value)
      ).not.toContainEqual(
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_UNSPECIFIED
      );
    });
  });
});
