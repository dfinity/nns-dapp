import {
  snsAggregatorIncludingAbortedProjectsStore,
  snsAggregatorStore,
} from "$lib/stores/sns-aggregator.store";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { aggregatorMockSnsesDataDto } from "$tests/mocks/sns-aggregator.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns-aggregator store", () => {
  beforeEach(() => {
    snsAggregatorIncludingAbortedProjectsStore.reset();
  });

  describe("snsAggregatorIncludingAbortedProjectsStore", () => {
    it("should set aggregator data", () => {
      snsAggregatorIncludingAbortedProjectsStore.setData(
        aggregatorMockSnsesDataDto
      );

      expect(get(snsAggregatorIncludingAbortedProjectsStore).data).toEqual(
        aggregatorMockSnsesDataDto
      );
    });

    it("should reset data", () => {
      snsAggregatorIncludingAbortedProjectsStore.setData(
        aggregatorMockSnsesDataDto
      );

      expect(get(snsAggregatorIncludingAbortedProjectsStore).data).toEqual(
        aggregatorMockSnsesDataDto
      );

      snsAggregatorIncludingAbortedProjectsStore.reset();
      expect(
        get(snsAggregatorIncludingAbortedProjectsStore).data
      ).toBeUndefined();
    });

    it("should set data even when data is populated", () => {
      snsAggregatorIncludingAbortedProjectsStore.setData(
        aggregatorMockSnsesDataDto
      );

      expect(get(snsAggregatorIncludingAbortedProjectsStore).data).toEqual(
        aggregatorMockSnsesDataDto
      );

      snsAggregatorIncludingAbortedProjectsStore.setData([
        aggregatorMockSnsesDataDto[0],
      ]);
      expect(get(snsAggregatorIncludingAbortedProjectsStore).data).toEqual([
        aggregatorMockSnsesDataDto[0],
      ]);
    });
  });

  describe("snsAggregatorStore", () => {
    const snsWithLifecycle = (
      sns: CachedSnsDto,
      lifecycle: SnsSwapLifecycle
    ) => ({
      ...sns,
      swap_state: {
        ...sns.swap_state,
        swap: {
          ...sns.swap_state.swap,
          lifecycle,
        },
      },
      lifecycle: {
        ...sns.lifecycle,
        lifecycle,
      },
    });

    const nonAbortedData = [
      snsWithLifecycle(aggregatorMockSnsesDataDto[0], SnsSwapLifecycle.Pending),
      snsWithLifecycle(aggregatorMockSnsesDataDto[1], SnsSwapLifecycle.Open),
      snsWithLifecycle(
        aggregatorMockSnsesDataDto[2],
        SnsSwapLifecycle.Committed
      ),
      snsWithLifecycle(aggregatorMockSnsesDataDto[3], SnsSwapLifecycle.Adopted),
    ];

    it("should start empty", () => {
      expect(get(snsAggregatorStore).data).toBeUndefined();
    });

    it("should hold non-aborted projects", () => {
      snsAggregatorIncludingAbortedProjectsStore.setData(nonAbortedData);
      expect(get(snsAggregatorStore).data).toEqual(nonAbortedData);
    });

    it("should not hold aborted projects", () => {
      const abortedProject1 = snsWithLifecycle(
        aggregatorMockSnsesDataDto[4],
        SnsSwapLifecycle.Aborted
      );
      const abortedProject2 = snsWithLifecycle(
        aggregatorMockSnsesDataDto[5],
        SnsSwapLifecycle.Aborted
      );
      const data = [abortedProject1, ...nonAbortedData, abortedProject2];

      snsAggregatorIncludingAbortedProjectsStore.setData(data);
      expect(get(snsAggregatorStore).data).toEqual(nonAbortedData);
    });
  });
});
