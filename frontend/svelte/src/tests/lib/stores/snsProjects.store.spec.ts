import { get } from "svelte/store";
import {
  snsFullProjectStore,
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

      expect($snsSummariesStore.summaries).toEqual(mockSnsSummaryList);
      expect($snsSummariesStore.certified).toBeFalsy();
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

  describe("snsFullProjectStore", () => {
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

      const $snsFullProjectStore = get(snsFullProjectStore);

      expect($snsFullProjectStore?.[0].rootCanisterId).toEqual(principal);
      expect($snsFullProjectStore?.[0].summary).toEqual(mockSnsSummaryList[0]);
      expect($snsFullProjectStore?.[0].swapState).toEqual(
        mockSnsSwapState(principal)
      );
    });
  });
});
