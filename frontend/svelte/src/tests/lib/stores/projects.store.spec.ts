import { get } from "svelte/store";
import {
  committedProjectsStore,
  openProjectsStore,
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
    it("should store summaries", () => {
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
    it("should store swap states", () => {
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
    it("should combine summaries with swap states", () => {
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

  describe("filter projects store", () => {
    beforeAll(() => {
      snsSummariesStore.reset();
    });

    afterAll(() => {
      snsSummariesStore.reset();
    });

    const summariesForLifecycle = (lifecycle) => [
      {
        ...mockSnsSummaryList[0],
        swap: {
          init: mockSnsSummaryList[0].swap.init,
          state: {
            ...mockSnsSummaryList[0].swap.state,
            lifecycle,
          },
        },
      },
    ];

    const principal = mockSnsSummaryList[0].rootCanisterId;

    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principal),
      certified: true,
    });

    it("should filter projects that are open", async () => {
      snsSummariesStore.setSummaries({
        summaries: summariesForLifecycle(2),
        certified: false,
      });

      const open = get(openProjectsStore);
      expect(open?.length).toEqual(1);

      snsSummariesStore.setSummaries({
        summaries: summariesForLifecycle(3),
        certified: false,
      });
      const noOpen = get(openProjectsStore);
      expect(noOpen?.length).toEqual(0);
    });

    it("should filter projects that are committed", async () => {
      snsSummariesStore.setSummaries({
        summaries: summariesForLifecycle(3),
        certified: false,
      });

      const committed = get(committedProjectsStore);
      expect(committed?.length).toEqual(1);

      snsSummariesStore.setSummaries({
        summaries: summariesForLifecycle(2),
        certified: false,
      });
      const noCommitted = get(committedProjectsStore);
      expect(noCommitted?.length).toEqual(0);
    });
  });
});
