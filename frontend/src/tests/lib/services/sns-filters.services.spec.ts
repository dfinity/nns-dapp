import { loadSnsFilters } from "$lib/services/sns-filters.services";
import { snsFiltesStore } from "$lib/stores/sns-filters.store";
import { enumSize } from "$lib/utils/enum.utils";
import { SnsProposalDecisionStatus } from "@dfinity/sns";
import { get } from "svelte/store";
import { mockPrincipal } from "../../mocks/auth.store.mock";

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
