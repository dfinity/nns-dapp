import { get } from "svelte/store";
import {
  snsFullProjectsStore,
  snsSummariesStore,
  snsSwapCommitmentsStore,
} from "../../../lib/stores/projects.store";
import type { SnsSwapCommitment } from "../../../lib/types/sns";
import {
  mockSnsSummaryList,
  mockSnsSwapCommitment,
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
      const swapCommitment = mockSnsSwapCommitment(
        mockSnsSummaryList[0].rootCanisterId
      ) as SnsSwapCommitment;
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment,
        certified: true,
      });

      const $snsSwapStatesStore = get(snsSwapCommitmentsStore);

      expect($snsSwapStatesStore?.[0].swapCommitment).toEqual(swapCommitment);
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
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(principal),
        certified: true,
      });

      const $snsFullProjectsStore = get(snsFullProjectsStore);

      expect($snsFullProjectsStore?.[0].rootCanisterId).toEqual(principal);
      expect($snsFullProjectsStore?.[0].summary).toEqual(mockSnsSummaryList[0]);
      expect($snsFullProjectsStore?.[0].swapCommitment).toEqual(
        mockSnsSwapCommitment(principal)
      );
    });
  });
});
