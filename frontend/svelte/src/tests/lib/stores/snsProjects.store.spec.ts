import { get } from "svelte/store";
import {
  snsFullProjectsStore,
  snsSummariesStore,
  snsSwapStatesStore,
} from "../../../lib/stores/projects.store";
import type { SnsSwapState } from "../../../lib/types/sns";
import {
  mockSnsSummaryList,
  mockSnsSwapState,
} from "../../mocks/sns-projects.mock";

describe("projects.store", () => {
  describe("snsSummariesStore", () => {
    it("should store summaries", async () => {
      snsSummariesStore.setSummaries({
        summaries: mockSnsSummaryList,
        certified: false,
      });

      const $snsSummariesStore = get(snsSummariesStore);

      expect($snsSummariesStore?.summaries).toEqual(mockSnsSummaryList);
      expect($snsSummariesStore?.certified).toBeFalsy();
    });
  });

  describe("snsSwapStatesStore", () => {
    it("should store swap states", async () => {
      const swapState = mockSnsSwapState(
        mockSnsSummaryList[0].rootCanisterId
      ) as SnsSwapState;
      snsSwapStatesStore.setSwapState({
        swapState,
        certified: true,
      });

      const $snsSwapStatesStore = get(snsSwapStatesStore);

      expect($snsSwapStatesStore?.[0].swapState).toEqual(swapState);
      expect($snsSwapStatesStore?.[0].certified).toBeTruthy();
    });
  });

  describe("snsFullProjectsStore", () => {
    it("should combine summaries with swap states", async () => {
      const principal = mockSnsSummaryList[0].rootCanisterId;

      snsSummariesStore.setSummaries({
        summaries: mockSnsSummaryList,
        certified: false,
      });
      snsSwapStatesStore.setSwapState({
        swapState: mockSnsSwapState(principal),
        certified: true,
      });

      const $snsFullProjectsStore = get(snsFullProjectsStore);

      expect($snsFullProjectsStore?.[0].rootCanisterId).toEqual(principal);
      expect($snsFullProjectsStore?.[0].summary).toEqual(mockSnsSummaryList[0]);
      expect($snsFullProjectsStore?.[0].swapState).toEqual(
        mockSnsSwapState(principal)
      );
    });
  });
});
